import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const schoolId = searchParams.get('school_id') || '1';
    const month = searchParams.get('month');
    
    const connection = await getConnection();
    
    // Staff overview
    const staffOverview = await connection.execute(`
      SELECT 
        st.id as staff_id,
        CONCAT(p.first_name, ' ', p.last_name) as staff_name,
        st.staff_no,
        st.position,
        st.status,
        st.hire_date,
        DATEDIFF(CURDATE(), STR_TO_DATE(st.hire_date, '%Y-%m-%d')) as days_employed,
        COUNT(DISTINCT sa.id) as attendance_records,
        COUNT(DISTINCT CASE WHEN sa.status = 'present' THEN sa.id END) as present_days,
        (COUNT(DISTINCT CASE WHEN sa.status = 'present' THEN sa.id END) / COUNT(DISTINCT sa.id) * 100) as attendance_rate
      FROM staff st
      JOIN people p ON st.person_id = p.id
      LEFT JOIN staff_attendance sa ON st.id = sa.staff_id 
        AND sa.date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      WHERE st.school_id = ? AND st.status = 'active'
      GROUP BY st.id, p.first_name, p.last_name, st.staff_no, st.position, st.status, st.hire_date
      ORDER BY st.staff_no
    `, [schoolId]);

    // Salary overview
    const salaryOverview = await connection.execute(`
      SELECT 
        st.id as staff_id,
        CONCAT(p.first_name, ' ', p.last_name) as staff_name,
        st.position,
        SUM(ss.amount) as total_salary,
        COUNT(DISTINCT sp.id) as payment_count,
        SUM(sp.amount) as total_paid,
        (SUM(ss.amount) - COALESCE(SUM(sp.amount), 0)) as outstanding_amount,
        MAX(sp.paid_at) as last_payment_date
      FROM staff st
      JOIN people p ON st.person_id = p.id
      LEFT JOIN staff_salaries ss ON st.id = ss.staff_id
      LEFT JOIN salary_payments sp ON st.id = sp.staff_id
      WHERE st.school_id = ? AND st.status = 'active'
      ${month ? 'AND ss.month = ?' : ''}
      GROUP BY st.id, p.first_name, p.last_name, st.position
      ORDER BY outstanding_amount DESC
    `, [schoolId, ...(month ? [month] : [])]);

    // Payroll distribution
    const payrollDistribution = await connection.execute(`
      SELECT 
        pd.name as definition_name,
        pd.type as definition_type,
        COUNT(DISTINCT ss.staff_id) as staff_count,
        SUM(ss.amount) as total_amount,
        AVG(ss.amount) as avg_amount,
        MIN(ss.amount) as min_amount,
        MAX(ss.amount) as max_amount
      FROM payroll_definitions pd
      LEFT JOIN staff_salaries ss ON pd.id = ss.definition_id
      LEFT JOIN staff st ON ss.staff_id = st.id
      WHERE pd.school_id = ?
      ${month ? 'AND ss.month = ?' : ''}
      GROUP BY pd.id, pd.name, pd.type
      ORDER BY total_amount DESC
    `, [schoolId, ...(month ? [month] : [])]);

    // Payment trends
    const paymentTrends = await connection.execute(`
      SELECT 
        DATE(sp.paid_at) as payment_date,
        COUNT(sp.id) as payment_count,
        SUM(sp.amount) as daily_total,
        AVG(sp.amount) as avg_payment,
        COUNT(DISTINCT sp.staff_id) as unique_staff_paid
      FROM salary_payments sp
      JOIN staff st ON sp.staff_id = st.id
      WHERE st.school_id = ?
      AND sp.paid_at >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
      GROUP BY DATE(sp.paid_at)
      ORDER BY payment_date DESC
    `, [schoolId]);

    // Staff by department/position
    const staffByPosition = await connection.execute(`
      SELECT 
        COALESCE(st.position, 'Not Specified') as position,
        COUNT(st.id) as staff_count,
        AVG(DATEDIFF(CURDATE(), STR_TO_DATE(st.hire_date, '%Y-%m-%d'))) as avg_tenure_days,
        COUNT(CASE WHEN st.status = 'active' THEN 1 END) as active_count,
        COUNT(CASE WHEN st.status != 'active' THEN 1 END) as inactive_count
      FROM staff st
      WHERE st.school_id = ?
      GROUP BY st.position
      ORDER BY staff_count DESC
    `, [schoolId]);

    // Outstanding payments
    const outstandingPayments = await connection.execute(`
      SELECT 
        st.id as staff_id,
        CONCAT(p.first_name, ' ', p.last_name) as staff_name,
        st.staff_no,
        st.position,
        SUM(ss.amount) as total_owed,
        COALESCE(SUM(sp.amount), 0) as total_paid,
        (SUM(ss.amount) - COALESCE(SUM(sp.amount), 0)) as outstanding,
        COUNT(DISTINCT ss.id) as salary_entries,
        MAX(sp.paid_at) as last_payment,
        DATEDIFF(CURDATE(), MAX(sp.paid_at)) as days_since_payment
      FROM staff st
      JOIN people p ON st.person_id = p.id
      LEFT JOIN staff_salaries ss ON st.id = ss.staff_id
      LEFT JOIN salary_payments sp ON st.id = sp.staff_id
      WHERE st.school_id = ? AND st.status = 'active'
      GROUP BY st.id, p.first_name, p.last_name, st.staff_no, st.position
      HAVING outstanding > 0
      ORDER BY outstanding DESC, days_since_payment DESC
      LIMIT 20
    `, [schoolId]);

    await connection.end();

    return NextResponse.json({
      success: true,
      data: {
        staffOverview: staffOverview[0],
        salaryOverview: salaryOverview[0],
        payrollDistribution: payrollDistribution[0],
        paymentTrends: paymentTrends[0],
        staffByPosition: staffByPosition[0],
        outstandingPayments: outstandingPayments[0]
      }
    });
  } catch (error: any) {
    console.error('Error fetching staff/payroll analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
