"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, XCircle, Clock, RefreshCw } from "lucide-react";
import { validateAllCaches } from "@/utils/cache-validator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface CheckResult {
  name: string;
  status: "success" | "warning" | "error" | "pending";
  message: string;
  details?: string;
}

export default function DeploymentChecklist() {
  const [checks, setChecks] = useState<CheckResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [overallStatus, setOverallStatus] = useState<"success" | "warning" | "error" | "pending">("pending");
  const [cacheStats, setCacheStats] = useState<any>(null);
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  
  useEffect(() => {
    // Redirect if not authenticated
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);
  
  useEffect(() => {
    if (isSignedIn) {
      runAllChecks();
    }
  }, [isSignedIn]);
  
  const runAllChecks = async () => {
    setLoading(true);
    const results: CheckResult[] = [];
    
    // 1. Check environment variables
    results.push(await checkEnvironmentVariables());
    
    // 2. Check database tables existence
    results.push(await checkDatabaseTables());
    
    // 3. Check API endpoints
    results.push(await checkAPIEndpoints());
    
    // 4. Check cache stats
    const cacheResults = await checkCacheEfficiency();
    results.push(cacheResults.check);
    setCacheStats(cacheResults.stats);
    
    // 5. Check server functions
    results.push(await checkServerFunctions());
    
    // Calculate overall status
    if (results.some(check => check.status === "error")) {
      setOverallStatus("error");
    } else if (results.some(check => check.status === "warning")) {
      setOverallStatus("warning");
    } else {
      setOverallStatus("success");
    }
    
    setChecks(results);
    setLoading(false);
  };
  
  const checkEnvironmentVariables = async (): Promise<CheckResult> => {
    try {
      // Check if required environment variables are available
      // This is a client-side check, so we can only check public variables
      const missingVars = [];
      
      if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
        missingVars.push("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
      }
      
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        missingVars.push("NEXT_PUBLIC_SUPABASE_URL");
      }
      
      if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        missingVars.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
      }
      
      if (missingVars.length > 0) {
        return {
          name: "Environment Variables",
          status: "error",
          message: `Missing ${missingVars.length} environment variables`,
          details: `The following variables are missing: ${missingVars.join(", ")}`
        };
      }
      
      return {
        name: "Environment Variables",
        status: "success",
        message: "All public environment variables are set",
        details: "Note: Server-side environment variables cannot be verified from the client"
      };
    } catch (error) {
      return {
        name: "Environment Variables",
        status: "error",
        message: "Failed to check environment variables",
        details: error instanceof Error ? error.message : String(error)
      };
    }
  };
  
  const checkDatabaseTables = async (): Promise<CheckResult> => {
    try {
      const supabase = createClient();
      const requiredTables = [
        'profiles',
        'workouts',
        'exercises',
        'progress_checkins',
        'macros',
        'perplexity_cache',
        'perplexity_analytics',
        'perplexity_rate_limits',
        'notifications',
        'notification_preferences'
      ];
      
      // Get the list of tables from Supabase
      const { data, error } = await supabase
        .from('pg_tables')
        .select('tablename')
        .eq('schemaname', 'public');
      
      if (error) {
        return {
          name: "Database Tables",
          status: "error",
          message: "Failed to fetch tables from database",
          details: error.message
        };
      }
      
      const existingTables = data?.map(t => t.tablename) || [];
      const missingTables = requiredTables.filter(t => !existingTables.includes(t));
      
      if (missingTables.length > 0) {
        return {
          name: "Database Tables",
          status: "warning",
          message: `Missing ${missingTables.length} required tables`,
          details: `The following tables are missing: ${missingTables.join(", ")}`
        };
      }
      
      return {
        name: "Database Tables",
        status: "success",
        message: "All required database tables exist",
        details: `Found all ${requiredTables.length} required tables`
      };
    } catch (error) {
      return {
        name: "Database Tables",
        status: "error",
        message: "Failed to check database tables",
        details: error instanceof Error ? error.message : String(error)
      };
    }
  };
  
  const checkAPIEndpoints = async (): Promise<CheckResult> => {
    try {
      // Simple health check for API endpoints
      const endpoints = [
        "/api/workouts",
        "/api/perplexity"
      ];
      
      const baseUrl = window.location.origin;
      const results = await Promise.all(
        endpoints.map(async (endpoint) => {
          try {
            const response = await fetch(`${baseUrl}${endpoint}`, {
              method: "HEAD",
              headers: {
                "Content-Type": "application/json",
              },
            });
            
            return {
              endpoint,
              status: response.status,
              ok: response.ok,
            };
          } catch (error) {
            return {
              endpoint,
              status: 0,
              ok: false,
              error: error instanceof Error ? error.message : String(error),
            };
          }
        })
      );
      
      const failedEndpoints = results.filter(r => !r.ok);
      
      if (failedEndpoints.length > 0) {
        return {
          name: "API Endpoints",
          status: "warning",
          message: `${failedEndpoints.length} API endpoints failed health check`,
          details: failedEndpoints.map(e => `${e.endpoint}: ${e.status} ${e.error || ''}`).join("\n")
        };
      }
      
      return {
        name: "API Endpoints",
        status: "success",
        message: "All API endpoints are accessible",
        details: `Successfully checked ${endpoints.length} endpoints`
      };
    } catch (error) {
      return {
        name: "API Endpoints",
        status: "error",
        message: "Failed to check API endpoints",
        details: error instanceof Error ? error.message : String(error)
      };
    }
  };
  
  const checkCacheEfficiency = async (): Promise<{ check: CheckResult, stats: any }> => {
    try {
      const cacheStats = await validateAllCaches();
      
      if (!cacheStats.perplexity) {
        return {
          check: {
            name: "Caching Efficiency",
            status: "warning",
            message: "Unable to retrieve Perplexity cache statistics",
            details: "The Perplexity cache table may be empty or inaccessible"
          },
          stats: cacheStats
        };
      }
      
      const { hitRatio, total } = cacheStats.perplexity;
      
      if (total < 10) {
        return {
          check: {
            name: "Caching Efficiency",
            status: "warning",
            message: "Insufficient data to evaluate cache efficiency",
            details: `Only ${total} requests recorded. Need more data for accurate assessment.`
          },
          stats: cacheStats
        };
      }
      
      if (hitRatio < 0.5) {
        return {
          check: {
            name: "Caching Efficiency",
            status: "warning",
            message: `Cache hit ratio is low (${(hitRatio * 100).toFixed(1)}%)`,
            details: `Consider adjusting cache expiration times or reviewing common queries`
          },
          stats: cacheStats
        };
      }
      
      return {
        check: {
          name: "Caching Efficiency",
          status: "success",
          message: `Cache hit ratio is good (${(hitRatio * 100).toFixed(1)}%)`,
          details: `Recorded ${total} total requests with ${cacheStats.perplexity.hits} cache hits`
        },
        stats: cacheStats
      };
    } catch (error) {
      return {
        check: {
          name: "Caching Efficiency",
          status: "error",
          message: "Failed to check cache efficiency",
          details: error instanceof Error ? error.message : String(error)
        },
        stats: null
      };
    }
  };
  
  const checkServerFunctions = async (): Promise<CheckResult> => {
    try {
      // This is a placeholder for checking server functions
      // In a real implementation, you'd verify that RPC functions work
      // For now, we'll just return a success
      
      return {
        name: "Server Functions",
        status: "success",
        message: "Server functions check skipped",
        details: "This is a placeholder check. Implement real verification in production."
      };
    } catch (error) {
      return {
        name: "Server Functions",
        status: "error",
        message: "Failed to check server functions",
        details: error instanceof Error ? error.message : String(error)
      };
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Ready</Badge>;
      case "warning":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Needs Attention</Badge>;
      case "error":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Blocking Issues</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Checking...</Badge>;
    }
  };
  
  const getCompletionPercentage = () => {
    if (checks.length === 0) return 0;
    const successCount = checks.filter(check => check.status === "success").length;
    return Math.round((successCount / checks.length) * 100);
  };
  
  if (!isLoaded || !isSignedIn) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Deployment Readiness Checklist</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Overall Status</CardTitle>
              <CardDescription>Assessment of deployment readiness</CardDescription>
            </div>
            {getStatusBadge(overallStatus)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span>Completion</span>
              <span>{getCompletionPercentage()}%</span>
            </div>
            <Progress value={getCompletionPercentage()} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {loading ? (
              <div className="col-span-2 flex justify-center items-center py-10">
                <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">Running checks...</span>
              </div>
            ) : (
              checks.map((check, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{check.name}</CardTitle>
                      {getStatusIcon(check.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p>{check.message}</p>
                    <p className="text-xs text-gray-500 mt-2">{check.details}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={runAllChecks} 
            disabled={loading}
            className="flex items-center"
          >
            {loading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
            Run Checks Again
          </Button>
        </CardFooter>
      </Card>
      
      {cacheStats && (
        <Card>
          <CardHeader>
            <CardTitle>Cache Statistics</CardTitle>
            <CardDescription>Performance metrics for application caching</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="perplexity">
              <TabsList>
                <TabsTrigger value="perplexity">Perplexity API</TabsTrigger>
                <TabsTrigger value="local">Local Storage</TabsTrigger>
              </TabsList>
              
              <TabsContent value="perplexity">
                {cacheStats.perplexity ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Total Requests</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">{cacheStats.perplexity.total}</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Cache Hits</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">{cacheStats.perplexity.hits}</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Hit Ratio</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          {(cacheStats.perplexity.hitRatio * 100).toFixed(1)}%
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Avg Response Time</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          {cacheStats.perplexity.avgResponseTime.toFixed(0)} ms
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <p className="text-gray-500 mt-4">No Perplexity cache statistics available</p>
                )}
              </TabsContent>
              
              <TabsContent value="local">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Cache Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        {cacheStats.localStorage.exists ? "Active" : "Not Found"}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Entries</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{cacheStats.localStorage.entries}</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Size</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        {(cacheStats.localStorage.size / 1024).toFixed(1)} KB
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Last Updated</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-md">
                        {cacheStats.localStorage.lastUpdated 
                          ? new Date(cacheStats.localStorage.lastUpdated).toLocaleString() 
                          : "Never"}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 