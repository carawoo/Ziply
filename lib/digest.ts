export async function buildDailyDigestHtml(dateKey: string) {
  // TODO: 실제 뉴스 요약/템플릿으로 교체
  return `
  <html>
    <body style="font-family:system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;">
      <h2>${dateKey} 부동산 아침 브리핑</h2>
      <ul>
        <li>헤드라인 A</li>
        <li>헤드라인 B</li>
        <li>헤드라인 C</li>
      </ul>
    </body>
  </html>`;
}