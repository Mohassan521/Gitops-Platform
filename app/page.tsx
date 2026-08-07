const deploymentInfo = {
  application: process.env.NEXT_PUBLIC_APP_NAME || "GitOps Control Center",
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT || "Development",
  version: process.env.NEXT_PUBLIC_APP_VERSION || "v1.0.0",
  commitSha: process.env.NEXT_PUBLIC_COMMIT_SHA || "local-build",
  deployedAt: process.env.NEXT_PUBLIC_DEPLOYED_AT || "Not deployed yet",
};

const services = [
  {
    name: "Frontend Application",
    description: "Next.js application serving the platform dashboard.",
    status: "Healthy",
    endpoint: "/",
  },
  {
    name: "Health API",
    description: "Application health endpoint used by Kubernetes probes.",
    status: "Healthy",
    endpoint: "/api/health",
  },
  {
    name: "GitOps Deployment",
    description: "ArgoCD integration will be added in an upcoming phase.",
    status: "Pending",
    endpoint: "Not configured",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <header className="mb-10 flex flex-col gap-6 border-b border-slate-800 pb-8 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Platform Operational
            </div>

            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              GitOps Control Center
            </h1>

            <p className="mt-3 max-w-2xl text-slate-400">
              Production-style dashboard for deployments, environments,
              application health and GitOps infrastructure.
            </p>
          </div>

          <a
            href="/api/health"
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center justify-center rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            Check Health API
          </a>
        </header>

        <section className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoCard
            label="Application"
            value={deploymentInfo.application}
          />

          <InfoCard
            label="Environment"
            value={deploymentInfo.environment}
          />

          <InfoCard
            label="Version"
            value={deploymentInfo.version}
          />

          <InfoCard
            label="Commit SHA"
            value={deploymentInfo.commitSha}
            mono
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="mb-6">
              <p className="text-sm font-medium uppercase tracking-wider text-emerald-400">
                Platform Services
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                Deployment Overview
              </h2>
            </div>

            <div className="space-y-4">
              {services.map((service) => (
                <div
                  key={service.name}
                  className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-950/60 p-5 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{service.name}</h3>

                      <StatusBadge status={service.status} />
                    </div>

                    <p className="mt-2 text-sm text-slate-400">
                      {service.description}
                    </p>
                  </div>

                  <code className="w-fit rounded-md bg-slate-800 px-3 py-2 text-xs text-slate-300">
                    {service.endpoint}
                  </code>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <p className="text-sm font-medium uppercase tracking-wider text-emerald-400">
              Deployment
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              Release Information
            </h2>

            <div className="mt-6 space-y-5">
              <DetailRow
                label="Current Environment"
                value={deploymentInfo.environment}
              />

              <DetailRow
                label="Application Version"
                value={deploymentInfo.version}
              />

              <DetailRow
                label="Git Commit"
                value={deploymentInfo.commitSha}
                mono
              />

              <DetailRow
                label="Deployed At"
                value={deploymentInfo.deployedAt}
              />
            </div>

            <div className="mt-8 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
              <p className="font-medium text-blue-300">Next Milestone</p>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Containerize this application with Docker and prepare it for
                automated CI builds.
              </p>
            </div>
          </aside>
        </section>

        <footer className="mt-10 border-t border-slate-800 pt-6 text-sm text-slate-500">
          Complete GitOps Platform · Built for production-focused DevOps
          learning
        </footer>
      </div>
    </main>
  );
}

function InfoCard({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <p className="text-sm text-slate-500">{label}</p>

      <p
        className={`mt-2 truncate text-lg font-semibold ${
          mono ? "font-mono text-sm text-emerald-400" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="border-b border-slate-800 pb-4 last:border-none">
      <p className="text-sm text-slate-500">{label}</p>

      <p
        className={`mt-1 text-sm font-medium ${
          mono ? "font-mono text-emerald-400" : "text-slate-200"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const healthy = status === "Healthy";

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        healthy
          ? "bg-emerald-500/10 text-emerald-400"
          : "bg-amber-500/10 text-amber-400"
      }`}
    >
      {status}
    </span>
  );
}