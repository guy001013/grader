import NextDocument, {
  Html,
  Head as NextHead,
  Main,
  NextScript,
  DocumentContext
} from 'next/document'

import { Head } from '@/components/Head/Index'

export default class Document extends NextDocument {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await NextDocument.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html lang="th">
        <NextHead>
          <Head />
          <meta charSet="utf-8" />
        </NextHead>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
