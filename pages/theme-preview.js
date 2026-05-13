import Head from 'next/head';
import previewBody from '../lib/preview-body';

export default function ThemePreviewPage() {
  return (
    <>
      <Head>
        <title>그라디언트 — preview gallery</title>
      </Head>
      <div
        id="theme-preview-mount"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: previewBody }}
      />
    </>
  );
}
