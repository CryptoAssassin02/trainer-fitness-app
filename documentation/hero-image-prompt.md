# Hero Image Prompt Guide for trAIner App

This document provides a detailed prompt to generate a high-quality hero image for the trAIner fitness application using AI image generators like Midjourney, DALL-E, or similar tools.

## Prompt for AI Image Generation

```
Create a futuristic fitness planning visualization that combines AI technology and workout planning.

The image should show:
- A sleek, holographic 3D display with a workout plan floating in mid-air
- The workout plan should have glowing neon blue (#3E9EFF) elements
- Dynamic data visualizations like progress charts or body metrics in the background
- Abstract AI neural network patterns subtly integrated into the design
- Modern, dark background (near-black #121212) with dramatic lighting
- A subtle grid or wireframe element to give it a tech feel
- Clean, minimalist aesthetic with high contrast
- No human faces or recognizable logos

Style: Photorealistic 3D rendering with sci-fi elements, sharp details, and professional lighting.
Aspect ratio: 16:9 landscape orientation
Mood: High-tech, motivational, and sophisticated
```

## Alternative Versions

If you want to generate variations, try these alternate prompts:

### Version 2: More Abstract

```
Create an abstract visualization representing AI-powered fitness planning. Show flowing, glowing blue (#3E9EFF) energy paths forming the silhouette of a workout plan or exercise routine. The background should be near-black (#121212) with subtle digital elements. Include data visualization elements like graphs or metrics subtly integrated into the composition. The overall feel should be high-tech, sleek and motivational without showing any human faces.
```

### Version 3: With Environment

```
Create a futuristic smart home gym environment with holographic workout planning interfaces. The main focus should be on a floating 3D workout plan with interactive elements in glowing electric blue (#3E9EFF). The environment should be minimal, dark (#121212 background) with ambient blue lighting. Include subtle AI visualization elements like neural network patterns integrated into the workout interface. No human faces should be visible. The image should convey high-tech fitness planning powered by artificial intelligence.
```

## Implementation Instructions

1. Copy your preferred prompt from above
2. Paste it into your AI image generation tool (Midjourney, DALL-E, etc.)
3. Generate several variations and choose the one that best fits the app's aesthetic
4. Download the highest resolution version available
5. Save the image as `hero-workout.jpg` in the `/public` directory
6. If necessary, use an image editing tool to crop to 16:9 aspect ratio
7. Optimize the image for web using a tool like squoosh.app to ensure fast loading

The Hero component is already configured to display this image at path `/hero-workout.jpg`.

## Testing the Image

After adding the image to your project:

1. Run the development server with `npm run dev`
2. Navigate to the homepage
3. Check that the image loads properly and complements the design
4. Verify the image looks good on different screen sizes
5. Ensure the image doesn't negatively impact page load performance 