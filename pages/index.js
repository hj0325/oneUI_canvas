export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/theme-preview',
      permanent: false,
    },
  };
}

export default function Home() {
  return null;
}
