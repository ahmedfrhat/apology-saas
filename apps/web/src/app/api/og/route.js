import fs from 'node:fs';
import path from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

let fontData = null;

export async function GET(request, context, c) {
  try {
    const url = new URL(request.url);
    const boy = url.searchParams.get('boy') || 'أنا';
    const girl = url.searchParams.get('girl') || 'أنتي';

    if (!fontData) {
      const fontPath = path.resolve('./public/Cairo-Bold.ttf');
      fontData = fs.readFileSync(fontPath);
    }

    const svg = await satori(
      {
        type: 'div',
        props: {
          style: {
            display: 'flex',
            height: '100%',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            backgroundImage: 'linear-gradient(to bottom right, #000000, #1A1A1A)',
            color: '#ffffff',
            textAlign: 'center',
            padding: '40px',
            fontFamily: 'Cairo',
          },
          children: [
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.05)',
                  border: '2px solid rgba(255,255,255,0.1)',
                  marginBottom: '20px',
                  fontSize: '60px',
                },
                children: '💝',
              },
            },
            {
              type: 'h1',
              props: {
                style: {
                  fontSize: '64px',
                  fontWeight: 'bold',
                  margin: '0',
                  marginBottom: '20px',
                  color: '#DFBA73',
                  lineHeight: '1.2',
                },
                children: `مفاجأة خاصة من ${boy} إلى ${girl}`,
              },
            },
            {
              type: 'p',
              props: {
                style: {
                  fontSize: '32px',
                  color: 'rgba(255,255,255,0.6)',
                  margin: '0',
                },
                children: 'Safi.io - منصة المصالحة الذكية',
              },
            },
          ],
        },
      },
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Cairo',
            data: fontData,
            weight: 700,
            style: 'normal',
          },
        ],
      }
    );

    const resvg = new Resvg(svg, {
      background: 'rgba(0,0,0,1)',
      fitTo: { mode: 'width', value: 1200 },
    });

    const pngData = resvg.render().asPng();

    return new Response(pngData, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('OG Image Generation Error:', error);
    return new Response('Error generating image', { status: 500 });
  }
}
