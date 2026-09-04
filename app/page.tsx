"use client";

import { FormEvent, useEffect , useState } from "react";

const deploymentInfo = {
  application:
    process.env.NEXT_PUBLIC_APP_NAME || "GitOps Control Center",
  environment:
    process.env.NEXT_PUBLIC_ENVIRONMENT || "Development",
  version:
    process.env.NEXT_PUBLIC_APP_VERSION || "v1.0.0",
  commitSha:
    process.env.NEXT_PUBLIC_COMMIT_SHA || "local-build",
  deployedAt:
    process.env.NEXT_PUBLIC_DEPLOYED_AT || "Not deployed yet",
};

const services = [
  {
    name: "Frontend Application",
    description: "Next.js application serving the platform dashboard.",
    status: "Healthy",
    endpoint: "/",
  },
  {
    name: "ArgoCD",
    description: "GitOps controller managing desired cluster state.",
    status: "Healthy",
    endpoint: "Synced",
  },
  {
    name: "Kubernetes",
    description: "K3s cluster running application workloads.",
    status: "Healthy",
    endpoint: "K3s",
  },
];

type ApplicationForm = {
  appName: string;
  repoUrl: string;
  branch: string;
  containerPort: string;
  servicePort: string;
  replicas: string;
};

type Application = {
  id: string;
  app_name: string;
  repo_url: string;
  branch: string;
  container_port: number;
  service_port: number;
  replicas: number;
  status: string;
};

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);

  const [form, setForm] = useState<ApplicationForm>({
    appName: "",
    repoUrl: "",
    branch: "main",
    containerPort: "3000",
    servicePort: "3000",
    replicas: "1",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
    const response = await fetch("/api/application", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(data.error);
      alert(data.error || "Failed to register application");
      return;
    }

    console.log("Application created:", data.application);

    await fetchApplications(); // Refresh the list of applications

    alert("Application registered successfully");

    setForm({
      appName: "",
      repoUrl: "",
      branch: "main",
      containerPort: "3000",
      servicePort: "3000",
      replicas: "1",
    });

    setShowModal(false);
  } catch (error) {
    console.error(error);
    alert("Something went wrong");
  }
  }

  async function fetchApplications() {
  try {
    const response = await fetch("/api/application");

    const data = await response.json();

    if (!response.ok) {
      console.error(data.error);
      return;
    }

    setApplications(data.applications);
  } catch (error) {
    console.error("Failed to fetch applications:", error);
  }
}

useEffect(() => {
  fetchApplications();
}, []);

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

            <p className="mt-4 max-w-2xl text-slate-400">
              Deploy and manage applications through an automated GitOps
              workflow.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex w-fit items-center justify-center rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            + Add Application
          </button>
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

            <section className="mt-10">
  <div className="mb-6">
    <p className="text-sm font-medium uppercase tracking-wider text-emerald-400">
      Applications
    </p>

    <h2 className="mt-2 text-2xl font-semibold">
      Onboarded Applications
    </h2>
  </div>

  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {applications.map((app) => (
      <div
        key={app.id}
        className="rounded-xl border border-slate-800 bg-slate-900/60 p-5"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">
            {app.app_name}
          </h3>

          <StatusBadge status={app.status} />
        </div>

        <p className="mt-3 truncate text-sm text-slate-400">
          {app.repo_url}
        </p>

        <div className="mt-4 space-y-2 text-sm text-slate-400">
          <p>Branch: {app.branch}</p>
          <p>Replicas: {app.replicas}</p>
          <p>Container Port: {app.container_port}</p>
          <p>Service Port: {app.service_port}</p>
        </div>
      </div>
    ))}
  </div>
</section>
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
              <p className="font-medium text-blue-300">
                Current Milestone
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Building reusable application onboarding for multiple
                developers and repositories.
              </p>
            </div>
          </aside>
        </section>

        <footer className="mt-10 border-t border-slate-800 pt-6 text-sm text-slate-500">
          Complete GitOps Platform · Built for production-focused DevOps
          learning
        </footer>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-wider text-emerald-400">
                  Application Onboarding
                </p>

                <h2 className="mt-2 text-2xl font-semibold">
                  Add Application
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Connect a GitHub repository and configure its Kubernetes
                  deployment.
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="text-xl text-slate-500 transition hover:text-slate-200"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <FormField
                label="Application Name"
                placeholder="my-store"
                value={form.appName}
                onChange={(value) =>
                  setForm({ ...form, appName: value })
                }
              />

              <FormField
                label="GitHub Repository"
                placeholder="https://github.com/user/my-store"
                value={form.repoUrl}
                onChange={(value) =>
                  setForm({ ...form, repoUrl: value })
                }
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Branch"
                  placeholder="main"
                  value={form.branch}
                  onChange={(value) =>
                    setForm({ ...form, branch: value })
                  }
                />

                <FormField
                  label="Replicas"
                  type="number"
                  value={form.replicas}
                  onChange={(value) =>
                    setForm({ ...form, replicas: value })
                  }
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Container Port"
                  type="number"
                  value={form.containerPort}
                  onChange={(value) =>
                    setForm({ ...form, containerPort: value })
                  }
                />

                <FormField
                  label="Service Port"
                  type="number"
                  value={form.servicePort}
                  onChange={(value) =>
                    setForm({ ...form, servicePort: value })
                  }
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-800 pt-5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-slate-700 px-5 py-2.5 font-medium text-slate-300 transition hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-emerald-500 px-5 py-2.5 font-semibold text-slate-950 transition hover:bg-emerald-400"
                >
                  Deploy Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </span>

      <input
        type={type}
        required
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-emerald-500"
      />
    </label>
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