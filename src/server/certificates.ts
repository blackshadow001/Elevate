import "server-only";
import { ApiError } from "@/server/api";
import { SessionUser } from "@/server/auth";
import { getDb } from "@/server/db";

function certificateDto(row: Record<string, unknown>) {
  const metadata = JSON.parse(String(row.metadata_json)) as Record<string, unknown>;
  return {
    id: String(row.id), certificateNumber: String(row.certificate_number), verificationId: String(row.verification_id),
    status: String(row.verification_status), issuedAt: String(row.issued_at), courseId: String(row.course_id),
    courseSlug: String(row.course_slug),
    studentName: String(metadata.studentName || row.student_name || ""),
    courseName: String(metadata.courseName || row.course_name || ""),
    instructorName: String(metadata.instructorName || row.instructor_name || ""),
    completedAt: String(metadata.completedAt || row.issued_at),
    skills: Array.isArray(metadata.skills) ? metadata.skills : [],
  };
}

const select = `SELECT cert.*,student.name student_name,c.title course_name,c.slug course_slug,instructor.name instructor_name
  FROM certificates cert JOIN users student ON student.id=cert.user_id
  JOIN courses c ON c.id=cert.course_id JOIN users instructor ON instructor.id=c.instructor_id`;

export function listOwnCertificates(user: SessionUser) {
  return getDb().prepare(`${select} WHERE cert.user_id=? ORDER BY cert.issued_at DESC`).all(user.id).map(certificateDto);
}

export function getOwnCertificate(id: string, user: SessionUser) {
  const row = getDb().prepare(`${select} WHERE cert.id=?`).get(id);
  if (!row) throw new ApiError(404, "CERTIFICATE_NOT_FOUND", "Certificate not found.");
  if (user.role !== "admin" && row.user_id !== user.id) throw new ApiError(403, "FORBIDDEN", "You can view only your own certificate.");
  return certificateDto(row);
}

export function verifyCertificate(number: string) {
  const row = getDb().prepare(`${select} WHERE cert.certificate_number=? OR cert.verification_id=?`).get(number, number);
  if (!row || row.verification_status !== "valid") return { valid: false, certificate: null };
  const certificate = certificateDto(row);
  return { valid: true, certificate: {
    certificateNumber: certificate.certificateNumber, studentName: certificate.studentName, courseName: certificate.courseName,
    instructorName: certificate.instructorName, completedAt: certificate.completedAt, issuedAt: certificate.issuedAt, skills: certificate.skills,
  } };
}
