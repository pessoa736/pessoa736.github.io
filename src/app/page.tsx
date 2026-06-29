import { getAllRepos } from "mySite/lib/github";
import { siteConfig } from "mySite/config/site";
import Hero from "mySite/plates/hero";
import Now from "mySite/plates/now";
import Stack from "mySite/plates/stack";
import FeaturedGrid from "mySite/plates/featured";
import OnAirList from "mySite/plates/onAir";

const now = [
  { label: "compiladores", href: "/projetos?area=sistemas" },
  { label: "lua + web", href: "/projetos?tag=lua" },
  { label: "puddingmoon", href: "/projetos/puddingMoon/" },
  { label: "ect / ufrn", href: "/sobre" },
];

export default async function Home() {
  let repos: Awaited<ReturnType<typeof getAllRepos>> = [];
  try {
    repos = await getAllRepos();
  } catch {
    /* sem rede — site ainda renderiza */
  }

  const featured = repos.filter((r) => siteConfig.featured.includes(r.name));
  const onAir = repos.filter((r) => siteConfig.onAirSlugs.includes(r.name));
  const withSite = repos.filter(
    (r) => r.homepage || (r.has_pages && r.name !== siteConfig.self.repoName),
  );

  return (
    <div className="relative pt-24 pb-16 px-4 sm:px-8 max-w-5xl mx-auto flex flex-col gap-16">
      <Hero />
      <Now items={now} />
      <Stack />
      <FeaturedGrid featured={featured} />
      {withSite.length > onAir.length && (
        <OnAirList repos={onAir.length ? onAir : withSite} />
      )}
    </div>
  );
}
