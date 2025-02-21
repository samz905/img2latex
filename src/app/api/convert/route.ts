import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase clients
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

// Client for general operations
const supabase = createClient(supabaseUrl, supabaseAnonKey);
// Admin client for bucket management
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!;
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const BUCKET_NAME = 'temp-uploads';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.error('No file provided in request');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('File received:', file.name, 'Size:', file.size);

    // Ensure bucket exists using admin client
    try {
      // Check if bucket exists and create if needed
      const { data: buckets, error: bucketsError } = await supabaseAdmin
        .storage
        .listBuckets();
        
      if (bucketsError) {
        console.error('Error listing buckets:', bucketsError);
        return NextResponse.json(
          { error: `Failed to list buckets: ${bucketsError.message}` },
          { status: 500 }
        );
      }
      
      const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);
      
      if (!bucketExists) {
        console.log('Bucket does not exist, creating...');
        const { error: createError } = await supabaseAdmin
          .storage
          .createBucket(BUCKET_NAME, {
            public: true,
            fileSizeLimit: 10485760, // 10MB
            allowedMimeTypes: ['image/jpeg', 'image/png']
          });
          
        if (createError) {
          console.error('Failed to create bucket:', createError);
          return NextResponse.json(
            { error: `Failed to create storage bucket: ${createError.message}` },
            { status: 500 }
          );
        }
      }

      // Always update bucket policy to ensure correct permissions
      const { error: policyError } = await supabaseAdmin
        .storage
        .updateBucket(BUCKET_NAME, {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png'],
          fileSizeLimit: 10485760
        });
        
      if (policyError) {
        console.error('Failed to update bucket policy:', policyError);
        return NextResponse.json(
          { error: `Failed to update bucket policy: ${policyError.message}` },
          { status: 500 }
        );
      }

      // Verify bucket is accessible
      const { data: bucketInfo, error: bucketError } = await supabaseAdmin.storage
        .getBucket(BUCKET_NAME);
        
      if (bucketError) {
        console.error('Error accessing bucket:', bucketError);
        return NextResponse.json(
          { error: `Cannot access bucket: ${bucketError.message}` },
          { status: 500 }
        );
      }
      
      console.log('Bucket info:', bucketInfo);

    } catch (error) {
      console.error('Error managing bucket:', error);
      return NextResponse.json(
        { error: 'Failed to manage storage bucket' },
        { status: 500 }
      );
    }

    // Upload to Supabase Storage using regular client
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_'); // Remove special characters
    const fileName = `${timestamp}_${cleanFileName}`;
    
    console.log('Attempting to upload to Supabase:', fileName);
    
    try {
      // Try the upload with regular client
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        return NextResponse.json(
          { error: `Failed to upload file: ${uploadError.message}` },
          { status: 500 }
        );
      }

      console.log('File uploaded successfully:', uploadData);

      // Get temporary URL
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

      console.log('Generated public URL:', publicUrl);

      // Call Deepseek API via OpenRouter
      const response = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL!,
          'X-Title': 'Img2LaTeX'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3-opus-20240229',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'You are a LaTeX expert. I will provide you with an image containing mathematical equations, text, or diagrams. Your task is to convert it into precise LaTeX code that will reproduce the content exactly as shown. Focus on accuracy and proper LaTeX syntax.'
                },
                {
                  type: 'text',
                  text: 'Here is the image to convert:'
                },
                {
                  type: 'image_url',
                  image_url: publicUrl
                }
              ]
            }
          ]
        })
      });

      const data = await response.json();
      console.log('AI Response:', data);

      if (!response.ok) {
        console.error('AI Error:', data);
        return NextResponse.json(
          { error: 'Failed to convert file: ' + (data.error?.message || 'Unknown error') },
          { status: 500 }
        );
      }

      // Extract LaTeX code from the response
      const latexCode = data.choices?.[0]?.message?.content || '';
      console.log('Generated LaTeX:', latexCode);

      // Delete the temporary file after processing
      await supabase.storage
        .from(BUCKET_NAME)
        .remove([fileName]);

      return NextResponse.json({
        latex: latexCode.trim()
      });

    } catch (error) {
      console.error('Upload error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Conversion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 