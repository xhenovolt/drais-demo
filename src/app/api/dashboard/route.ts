import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET(req: NextRequest) {
  const connection = await getConnection();

  try {
    // Fetch total classes
    const [classes] = await connection.execute('SELECT COUNT(*) AS total_classes FROM classes');

    // Fetch total learners
    const [learners] = await connection.execute('SELECT COUNT(*) AS total_learners FROM students WHERE status = "active"');

    // Fetch total boys and girls
    const [genderCounts] = await connection.execute(`
      SELECT 
        SUM(CASE WHEN p.gender = 'M' THEN 1 ELSE 0 END) AS boys,
        SUM(CASE WHEN p.gender = 'F' THEN 1 ELSE 0 END) AS girls
      FROM students s
      JOIN people p ON s.person_id = p.id
      WHERE s.status = "active"
    `);

    // Fetch total staff members
    const [staff] = await connection.execute('SELECT COUNT(*) AS total_staff FROM staff WHERE status = "active"');

    // Fetch total parents
    const [parents] = await connection.execute('SELECT COUNT(DISTINCT student_id) AS total_parents FROM student_contacts');

    // Fetch learners admitted in various timeframes
    const [admissions] = await connection.execute(`
      SELECT
        SUM(CASE WHEN DATE(admission_date) = CURDATE() THEN 1 ELSE 0 END) AS today,
        SUM(CASE WHEN DATE(admission_date) = CURDATE() - INTERVAL 1 DAY THEN 1 ELSE 0 END) AS yesterday,
        SUM(CASE WHEN DATE(admission_date) >= CURDATE() - INTERVAL 7 DAY THEN 1 ELSE 0 END) AS last_week,
        SUM(CASE WHEN DATE(admission_date) >= CURDATE() - INTERVAL 1 MONTH THEN 1 ELSE 0 END) AS last_month,
        SUM(CASE WHEN DATE(admission_date) >= CURDATE() - INTERVAL 3 MONTH THEN 1 ELSE 0 END) AS last_3_months,
        SUM(CASE WHEN YEAR(admission_date) = YEAR(CURDATE()) THEN 1 ELSE 0 END) AS this_year,
        SUM(CASE WHEN YEAR(admission_date) = YEAR(CURDATE()) - 1 THEN 1 ELSE 0 END) AS last_year
      FROM students
    `);

    // Fetch learners' payment statuses
    const [paymentStats] = await connection.execute(`
      SELECT
        SUM(CASE WHEN balance = 0 THEN 1 ELSE 0 END) AS fully_paid,
        SUM(CASE WHEN balance > 0 AND paid > 0 THEN 1 ELSE 0 END) AS partially_paid
      FROM student_fee_items
    `);

    // Fetch improving and declining learners
    const [learnerPerformance] = await connection.execute(`
      SELECT
        SUM(CASE WHEN cr.score > 75 THEN 1 ELSE 0 END) AS improving_learners,
        SUM(CASE WHEN cr.score < 40 THEN 1 ELSE 0 END) AS declining_learners
      FROM class_results cr
    `);

    // Fetch best and worst learners
    const [bestLearner] = await connection.execute(`
      SELECT p.first_name, p.last_name, MAX(cr.score) AS best_score
      FROM class_results cr
      JOIN students s ON cr.student_id = s.id
      JOIN people p ON s.person_id = p.id
      GROUP BY cr.student_id
      ORDER BY best_score DESC
      LIMIT 1
    `);

    const [worstLearner] = await connection.execute(`
      SELECT p.first_name, p.last_name, MIN(cr.score) AS worst_score
      FROM class_results cr
      JOIN students s ON cr.student_id = s.id
      JOIN people p ON s.person_id = p.id
      GROUP BY cr.student_id
      ORDER BY worst_score ASC
      LIMIT 1
    `);

    // Fetch term progress
    const [termProgress] = await connection.execute(`
      SELECT
        t.name AS term_name,
        DATEDIFF(t.end_date, CURDATE()) AS remaining_days,
        DATEDIFF(CURDATE(), t.start_date) AS days_covered,
        COUNT(DISTINCT tp.day_date) AS weekends_covered,
        COUNT(DISTINCT ph.date) AS public_days
      FROM terms t
      LEFT JOIN term_progress_log tp ON tp.term_id = t.id AND WEEKDAY(tp.day_date) IN (5, 6)
      LEFT JOIN public_holidays ph ON ph.date BETWEEN t.start_date AND t.end_date
      WHERE t.status = "active"
      GROUP BY t.id
    `);

    return NextResponse.json({
      success: true,
      data: {
        total_classes: classes[0]?.total_classes || 0,
        total_learners: learners[0]?.total_learners || 0,
        boys: genderCounts[0]?.boys || 0,
        girls: genderCounts[0]?.girls || 0,
        total_staff: staff[0]?.total_staff || 0,
        total_parents: parents[0]?.total_parents || 0,
        admissions: admissions[0] || {},
        payment_stats: paymentStats[0] || {},
        learner_performance: learnerPerformance[0] || {},
        best_learner: bestLearner[0] || null,
        worst_learner: worstLearner[0] || null,
        term_progress: termProgress[0] || {
          term_name: "No Active Term",
          remaining_days: 0,
          days_covered: 0,
          weekends_covered: 0,
          public_days: 0,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch dashboard data' }, { status: 500 });
  } finally {
    await connection.end();
  }
}
