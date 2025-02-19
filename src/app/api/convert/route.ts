import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!;
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Upload to Supabase Storage
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('temp-uploads')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Get temporary URL
    const { data: { publicUrl } } = supabase.storage
      .from('temp-uploads')
      .getPublicUrl(fileName);

    // Call Deepseek API via OpenRouter
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL!,
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat:free',
        messages: [
          {
            role: 'user',
            content: `Convert this document/image to LaTeX code. The file is available at: ${publicUrl}. Return only raw LaTeX code without Markdown or explanations.`
          }
        ]
      })
    });

    const data = await response.json();
    
    // Delete the temporary file after processing
    await supabase.storage
      .from('temp-uploads')
      .remove([fileName]);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to convert file' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      latex: data.choices[0].message.content.trim()
    });

  } catch (error) {
    console.error('Conversion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 