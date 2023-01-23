import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { providers } from "near-api-js";
import { Buffer } from "node:buffer";

const provider = new providers.JsonRpcProvider({
  url: "https://rpc.mainnet.internal.near.org",
});

type Data = {
  account: string;
  description: string;
  imageUrl: string;
  title: string;
  url: string;
};

export const getServerSideProps: GetServerSideProps<{ data: Data }> = async (
  context
) => {
  const accountId = context.query.accountId as string;
  const args = {
    keys: [`${accountId}/post/main`],
  };

  const buffer = Buffer.from(JSON.stringify(args));

  const rawResult = await provider.query<any>({
    request_type: "call_function",
    account_id: "social.near",
    method_name: "get",
    args_base64: buffer.toString("base64"),
    block_id: parseInt(context.query.blockHeight as any),
  });

  const res = JSON.parse(Buffer.from(rawResult.result).toString());
  const message = JSON.parse(res[accountId].post.main).text;

  return {
    props: {
      data: {
        account: accountId,
        description: message,
        imageUrl: "https://near.social/assets/logo.png",
        title: `Social Post: ${accountId}`,
        url: context.req.headers.referer!,
      },
    },
  };
};

export default function MyPage({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Head>
        {/* https://css-tricks.com/essential-meta-tags-social-media/ */}

        <title>{data.title}</title>
        <meta name="description" content={data.description} />

        <meta property="og:title" content={data.title} />
        <meta property="og:type" content="website" />
        <meta property="og:description" content={data.description} />
        <meta property="og:image" content={data.imageUrl} />
        <meta property="og:url" content={data.url} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <div>
        <h1>{data.title}</h1>
        <p>{data.description}</p>
      </div>
    </>
  );
}
