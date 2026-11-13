
export const company = {
  name: "Growth For Impact",
  product: "Resume Screening Dashboard",
};

export const roles = [
  {
    id: "lca-consultant",
    href: "/roles/lca-consultant",
    title: "LCA Consultant",
    summary:
      "Screens for life cycle assessment experience, LCA software, and the ISO 14040 / 14044 standards.",
    experience: {
      label: "Years of experience",
      conflict: false,
      sources: [
        {
          id: "assignment-pdf",
          label: "Assignment PDF",
          range: "4–6 years",
        },
      ],
    },
    requirements: [
      { id: "lca-lci", text: "LCA and LCI experience" },
      { id: "software", text: "GaBi or SimaPro" },
      { id: "iso", text: "ISO 14040 and ISO 14044" },
      { id: "projects", text: "At least 3 LCA projects" },
      {
        id: "education",
        text: "Environmental education preferred",
        preferred: true,
      },
    ],
  },
  {
    id: "ui-ux-design-intern",
    href: "/roles/ui-ux-design-intern",
    title: "UI/UX Design Intern",
    summary:
      "Screens for early-career design practice, Figma, prototyping, and user research.",
    experience: {
      label: "Years of experience",
      conflict: false,
      sources: [
        {
          id: "job-description",
          label: "Supplied job description",
          range: "0–1 year",
        },
      ],
    },
    requirements: [
      { id: "figma", text: "Figma" },
      { id: "principles", text: "UI/UX principles" },
      { id: "prototyping", text: "Prototyping" },
      { id: "research", text: "User research" },
      { id: "psychology", text: "Understanding of user psychology" },
      { id: "aesthetic", text: "Creative and aesthetic skills" },
    ],
  },
];

export const navigation = [
  { href: "/", label: "Overview" },
  ...roles.map((role) => ({ href: role.href, label: role.title })),
  { href: "/candidates", label: "All Candidates" },
  { href: "/upload", label: "Upload Resumes" },
];

export function getRole(roleId) {
  return roles.find((role) => role.id === roleId) || null;
}

export function roleTitle(roleId) {
  if (!roleId) return "Unassigned";
  const role = getRole(roleId);
  return role ? role.title : "Unassigned";
}
