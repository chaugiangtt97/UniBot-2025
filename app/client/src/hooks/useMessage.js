const ErrorMessage = {
  WRONG_PASSWORD: "Tài Khoản hoặc mật khẩu không hợp lệ",
  USER_DOES_NOT_EXIST: "Tài Khoản hoặc mật khẩu không hợp lệ",
  ERR_CONNECTION_REFUSED: "Server Không Hoạt Động",

  // hỗ trợ cả 2 dạng code
  EMAIL_ALREADY_EXIST: "Email đã tồn tại. Vui lòng nhập tài khoản khác !",
  EMAIL_ALREADY_EXISTS: "Email đã tồn tại. Vui lòng nhập tài khoản khác !",

  "THIS ACCOUNT HAVE BEEN VERIFIED": "Tài Khoản Này Đã Được Xác Minh !",
};

const Code = {
  "DEPT-GV": "Ban Giáo Vụ",
  female: "Nữ",
  male: "Nam",
  school_year: "Năm Học",
  keywords: "Từ Khóa",
  majors: "Chuyên Ngành",
  subjects_code: "Mã Môn Học",
  subjects_name: "Tên Môn Học",
  "PR-CLC": "Chất Lượng Cao",
  K21: "Khóa 2021",
  K24: "Khóa 2024",
  K23: "Khóa 2023",
  K22: "Khóa 2022",
  K20: "Khóa 2020",
  KHMT: "Khoa Học Máy Tính",
  "PR-CNTN": "Cử Nhân Tài Năng",
  "PR-DT": "Đại Trà",
  "PR-VP": "Việt - Pháp",
  CNPM: "Công Nghệ Phần Mềm",
  HTTT: "Hệ Thống Thông Tin",
  TGMT: "Thị Giác Máy Tính",
  CNTTHUC: "Công Nghệ Tri Thức",
  CNTT: "Công Nghệ Thông Tin",
  NONE: "Không có ( Chưa xét chuyên ngành )",
  student_handbook: "Sổ tay sinh viên",
  events: "Thông tin sự kiện",
  academic_affairs: "Nội quy trường",
  timetable: "Thời khóa biểu",
  recruitment: "Thông tin tuyển dụng",
  scholarship: "Thông Tin Học Bổng",
  trainingBatch_K23: "Khóa 2023",
};

export const useErrorMessage = (code) => {
  if (!code) return "";

  const parts = String(code).split(".");
  const last = parts[parts.length - 1];

  return ErrorMessage[last] ? ErrorMessage[last] : last;
};

export const useCode = (code) => {
  return Code[code] ? Code[code] : code;
};

export default {
  useErrorMessage,
  useCode,
};