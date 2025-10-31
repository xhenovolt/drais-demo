use client;
import React, { useEffect, useState } from 'react';
import Image from 'next/image';

const ArabicReportsPage = () => {
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const response = await fetch(`/api/reports/student?student_id=1&term_id=1`);
        const data = await response.json();
        if (data.success) {
          setReportData(data);
        }
      } catch (error) {
        console.error('فشل في جلب بيانات التقرير:', error);
      }
    };

    fetchReportData();
  }, []);

  if (!reportData) {
    return <div>جاري التحميل...</div>;
  }

  const { school, student, results, comments } = reportData;

  return (
    <div className="p-8 text-right" dir="rtl">
      {/* معلومات المدرسة */}
      <div className="flex justify-between items-center mb-8">
        <div className="text-right">
          <h1 className="text-xl font-bold">{school.arabic_name}</h1>
          <p>{school.arabic_address}</p>
          <p>{school.arabic_contact}</p>
          <p>{school.arabic_center_no}</p>
          <p>{school.arabic_registration_no}</p>
        </div>
        <div className="text-center">
          <Image src="/school-logo.png" alt="شعار المدرسة" width={100} height={100} />
        </div>
        <div className="text-left">
          <h1 className="text-xl font-bold">{school.name}</h1>
          <p>{school.address}</p>
          <p>{school.contact}</p>
          <p>{school.center_no}</p>
          <p>{school.registration_no}</p>
        </div>
      </div>

      {/* معلومات الطالب */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold">معلومات الطالب</h2>
        <p><strong>الاسم:</strong> {student.first_name} {student.last_name}</p>
        <p><strong>العمر:</strong> {student.age} سنة</p>
        <p><strong>الصف:</strong> {student.class_name}</p>
      </div>

      {/* جدول النتائج */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold">النتائج</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">المادة</th>
              <th className="border border-gray-300 px-4 py-2">الدرجة</th>
              <th className="border border-gray-300 px-4 py-2">من</th>
              <th className="border border-gray-300 px-4 py-2">ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={index}>
                <td className="border border-gray-300 px-4 py-2">{result.subject_name}</td>
                <td className="border border-gray-300 px-4 py-2">{result.score}</td>
                <td className="border border-gray-300 px-4 py-2">{result.out_of}</td>
                <td className="border border-gray-300 px-4 py-2">{result.remarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* قسم التعليقات */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold">التعليقات</h2>
        <p><strong>تعليق المعلم:</strong> {comments.class_teacher_comment}</p>
        <p><strong>تعليق مدير الدراسات:</strong> {comments.dos_comment}</p>
        <p><strong>تعليق المدير:</strong> {comments.headteacher_comment}</p>
      </div>
    </div>
  );
};

export default ArabicReportsPage;