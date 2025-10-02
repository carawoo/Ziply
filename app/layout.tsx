import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Ziply',
  description: 'Ziply - 부동산 초보자를 위한 맞춤형 뉴스 요약 서비스',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        {/* Google Search Console Verification */}
        <meta name="google-site-verification" content="9dSayXBf_fc1PjSmzxfDlLOiD7TMs619acnfKV5AevE" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2510776388416939"
          crossOrigin="anonymous"
        />
        {/* Kakao Channel SDK for potential inline buttons */}
        <script
          defer
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
          crossOrigin="anonymous"
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
