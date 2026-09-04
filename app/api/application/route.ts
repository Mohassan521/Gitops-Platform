import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);


export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      appName,
      repoUrl,
      branch,
      containerPort,
      servicePort,
      replicas,
    } = body;

    // 1. Basic validation
    if (
      !appName ||
      !repoUrl ||
      !branch ||
      !containerPort ||
      !servicePort ||
      !replicas
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // 2. Parse GitHub repository URL
    const githubRepo = parseGitHubRepo(repoUrl.trim());

    if (!githubRepo) {
      return NextResponse.json(
        { error: "Invalid GitHub repository URL" },
        { status: 400 }
      );
    }

    // 3. Check whether GitHub repository actually exists
    const repoResponse = await fetch(
      `https://api.github.com/repos/${githubRepo.owner}/${githubRepo.repo}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
        },
      }
    );

    if (!repoResponse.ok) {
      return NextResponse.json(
        { error: "GitHub repository not found or inaccessible" },
        { status: 400 }
      );
    }

    // 4. Check whether Dockerfile exists on selected branch
    const dockerfileResponse = await fetch(
      `https://api.github.com/repos/${githubRepo.owner}/${githubRepo.repo}/contents/Dockerfile?ref=${branch.trim()}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
        },
      }
    );

    if (!dockerfileResponse.ok) {
      return NextResponse.json(
        { error: "Dockerfile not found in repository root or branch does not exist" },
        { status: 400 }
      );
    }

    // 5. Convert numeric values
    const containerPortNumber = Number(containerPort);
    const servicePortNumber = Number(servicePort);
    const replicasNumber = Number(replicas);

    if (
      !Number.isInteger(containerPortNumber) ||
      !Number.isInteger(servicePortNumber) ||
      !Number.isInteger(replicasNumber) ||
      containerPortNumber <= 0 ||
      servicePortNumber <= 0 ||
      replicasNumber <= 0
    ) {
      return NextResponse.json(
        { error: "Ports and replicas must be valid positive integers" },
        { status: 400 }
      );
    }

    // 6. Generate deployment-specific values
    const namespace = appName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-");

    const imageRepository =
      `ghcr.io/${process.env.GHCR_OWNER}/${namespace}`;

    const ingressHost =
      `${namespace}.62.238.34.238.sslip.io`;

    // 7. Save application in Supabase
    const { data, error } = await supabase
      .from("applications")
      .insert({
        app_name: appName.trim(),
        repo_url: repoUrl.trim(),
        branch: branch.trim(),

        container_port: containerPortNumber,
        service_port: servicePortNumber,
        replicas: replicasNumber,

        image_repository: imageRepository,
        namespace: namespace,
        ingress_host: ingressHost,

        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);

      if (error.code === "23505") {
        return NextResponse.json(
          { error: "An application with this name already exists" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "Failed to create application" },
        { status: 500 }
      );
    }

    // 8. Return created application
    return NextResponse.json(
      {
        message: "Application registered successfully",
        application: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Application onboarding error:", error);

    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}


export async function GET() {
  try {
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase fetch error:", error);

      return NextResponse.json(
        { error: "Failed to fetch applications" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { applications: data },
      { status: 200 }
    );
  } catch (error) {
    console.error("Applications fetch error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

function parseGitHubRepo(repoUrl: string) {
  const match = repoUrl.match(
    /^https:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?$/
  );

  if (!match) {
    return null;
  }

  return {
    owner: match[1],
    repo: match[2],
  };
}