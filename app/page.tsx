'use client';

import Synthesizer from '@/components/synth';
import { Card } from '@/components/ui/card';
import AppWrapper from '@/components/wrapper';
import Link from 'next/link';
import { useEffect } from 'react';

const Page = () => {
  useEffect(() => {
    document.body.click();
  }, []);

  return (
    <AppWrapper>
      <div className="h-full max-w-3xl mx-auto flex items-center justify-center">
        <div className="absolute top-8 left-8 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-start flex-col gap-4">
              <div className="flex items-center gap-2 flex-col">
                <h1 className="text-3xl font-bold text-black">
                  Da.<span className="text-orange-500">Synth</span>
                </h1>
                <p className="text-gray-500 text-sm">ダ・シンセ</p>
              </div>
              <div className="flex underline mt-8 font-mono items-center gap-2">
                (*) means the effect is experimental
                <br /> and may have bugs.
              </div>
            </div>
          </div>
        </div>

        <svg
          className="absolute inset-0 -z-10 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <pattern
            id="smiley-pattern"
            x="0"
            y="0"
            width="50"
            height="50"
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="rgba(0,0,0,0.1)"
              strokeWidth="2"
            />
            <circle cx="18" cy="20" r="2" fill="rgba(0,0,0,0.1)" />
            <circle cx="32" cy="20" r="2" fill="rgba(0,0,0,0.1)" />
            <path
              d="M 15 30 Q 25 40 35 30"
              fill="none"
              stroke="rgba(0,0,0,0.1)"
              strokeWidth="2"
            />
          </pattern>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="url(#smiley-pattern)"
          />
        </svg>
        <Synthesizer />
        <Card className="absolute text-black bottom-8 right-8 p-4">
          Designed and developed by{' '}
          <Link
            className="text-black font-bold hover:underline"
            href="https://github.com/triyanox"
            target="_blank"
            rel="noopener noreferrer"
          >
            Mohamed Achaq
          </Link>
        </Card>
      </div>
    </AppWrapper>
  );
};

export default Page;
