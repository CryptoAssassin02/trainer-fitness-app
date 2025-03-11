interface CursorRunFunctionResponse {
  data?: any;
  error?: string;
  successful: boolean;
  successfull?: boolean; // Typo in the API response
}

interface CursorWindow extends Window {
  cursor?: {
    runFunction: (
      functionName: string, 
      params: { params: Record<string, any> }
    ) => Promise<CursorRunFunctionResponse>;
  };
}

declare global {
  interface Window {
    cursor?: {
      runFunction: (
        functionName: string, 
        params: { params: Record<string, any> }
      ) => Promise<CursorRunFunctionResponse>;
    };
  }
}

export {}; 