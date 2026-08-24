export function slugify(value) {
  return String(value || "course")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "course";
}

export function courseSlug(course) {
  return course?.slug || course?.course_slug || slugify(course?.title);
}
