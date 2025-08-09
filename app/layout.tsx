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
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2510776388416939"
          crossOrigin="anonymous"
        />
        {/* Kakao Channel SDK for potential inline buttons */}
        <script
          defer
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
          integrity="sha384-Ti3hJxDA0Uo7YzH6W8Jk0reOqHcqWl3o7I5a5V7u0x4K4rK74XwQnTqv1o0QvNw2"
          crossOrigin="anonymous"
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
