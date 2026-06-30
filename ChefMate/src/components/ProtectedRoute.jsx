import { useEffect } from 'react';
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

const DefaultFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
  </div>
);

export default function ProtectedRoute({ 
  fallback = <DefaultFallback />, 
  unauthenticatedElement = <Navigate to="/login" replace />,
  requireAdmin = false, // แอบเพิ่มตัวเช็กสิทธิ์แอดมินเข้าไป
  children 
}) {
  // 1. ดึงข้อมูล User จากระบบใหม่ของเรา (LocalStorage)
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  // 2. ถ้ายังไม่ได้ล็อกอิน (ไม่มีข้อมูล) -> ส่งกลับไปหน้า unauthenticatedElement (หน้า Login)
  if (!user) {
    return unauthenticatedElement;
  }

  // 3. ถ้าหน้านี้ล็อกไว้สำหรับ Admin แต่คนเข้ามีแค่สิทธิ์ User ธรรมดา
  if (requireAdmin && user.role !== "admin") {
    return <Navigate to="/" replace />; // เตะกลับหน้าแรกแบบนุ่มนวล
  }

  // 4. ถ้าผ่านทุกเงื่อนไข (มีสิทธิ์เข้าถึง) ก็ให้แสดงผลหน้านั้นๆ ได้เลย
  return children ? children : <Outlet />;
}