import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const schoolId = searchParams.get('school_id') || '1';
    
    const connection = await getConnection();
    
    // Enrollment trends by class
    const enrollmentByClass = await connection.execute(`
      SELECT 
        c.name as class_name,
        COUNT(CASE WHEN s.status = 'active' THEN 1 END) as active_students,
        COUNT(CASE WHEN s.status = 'inactive' THEN 1 END) as inactive_students,
        COUNT(CASE WHEN p.gender = 'M' AND s.status = 'active' THEN 1 END) as male_students,
        COUNT(CASE WHEN p.gender = 'F' AND s.status = 'active' THEN 1 END) as female_students,
        AVG(DATEDIFF(CURDATE(), STR_TO_DATE(s.admission_date, '%Y-%m-%d'))) as avg_days_enrolled
      FROM students s
      JOIN people p ON s.person_id = p.id
      JOIN enrollments e ON s.id = e.student_id
      JOIN classes c ON e.class_id = c.id
      WHERE s.school_id = ?
      GROUP BY c.id, c.name
      ORDER BY active_students DESC
    `, [schoolId]);

    // New admissions trend
    const newAdmissions = await connection.execute(`
      SELECT 
        DATE_FORMAT(STR_TO_DATE(s.admission_date, '%Y-%m-%d'), '%Y-%m') as admission_month,
        COUNT(s.id) as new_admissions,
        COUNT(CASE WHEN p.gender = 'M' THEN 1 END) as male_admissions,
        COUNT(CASE WHEN p.gender = 'F' THEN 1 END) as female_admissions
      FROM students s
      JOIN people p ON s.person_id = p.id
      WHERE s.school_id = ? 
      AND s.admission_date IS NOT NULL
      AND STR_TO_DATE(s.admission_date, '%Y-%m-%d') >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(STR_TO_DATE(s.admission_date, '%Y-%m-%d'), '%Y-%m')
      ORDER BY admission_month DESC
    `, [schoolId]);

    // Dropout analysis
    const dropoutAnalysis = await connection.execute(`
      SELECT 
        c.name as class_name,
        COUNT(CASE WHEN s.status = 'inactive' THEN 1 END) as dropouts,
        COUNT(s.id) as total_ever_enrolled,
        ROUND(COUNT(CASE WHEN s.status = 'inactive' THEN 1 END) / COUNT(s.id) * 100, 2) as dropout_rate,
        AVG(CASE WHEN s.status = 'inactive' THEN 
          DATEDIFF(COALESCE(STR_TO_DATE(s.updated_at, '%Y-%m-%d'), CURDATE()), 
                   STR_TO_DATE(s.admission_date, '%Y-%m-%d')) END) as avg_days_before_dropout
      FROM students s
      JOIN enrollments e ON s.id = e.student_id
      JOIN classes c ON e.class_id = c.id
      WHERE s.school_id = ?
      GROUP BY c.id, c.name
      ORDER BY dropout_rate DESC
    `, [schoolId]);

    // Retention by academic year
    const retentionByYear = await connection.execute(`
      SELECT 
        ay.name as academic_year,
        COUNT(DISTINCT s.id) as total_students,
        COUNT(CASE WHEN s.status = 'active' THEN 1 END) as retained_students,
        ROUND(COUNT(CASE WHEN s.status = 'active' THEN 1 END) / COUNT(DISTINCT s.id) * 100, 2) as retention_rate
      FROM students s
      JOIN enrollments e ON s.id = e.student_id
      LEFT JOIN academic_years ay ON e.academic_year_id = ay.id
      WHERE s.school_id = ?
      GROUP BY ay.id, ay.name
      ORDER BY ay.name DESC
    `, [schoolId]);

    // Geographic distribution
    const geographicDistribution = await connection.execute(`
      SELECT 
        d.name as district_name,
        c.name as county_name,
        COUNT(s.id) as student_count,
        COUNT(CASE WHEN p.gender = 'M' THEN 1 END) as male_count,
        COUNT(CASE WHEN p.gender = 'F' THEN 1 END) as female_count
      FROM students s
      JOIN people p ON s.person_id = p.id
      LEFT JOIN villages v ON s.village_id = v.id
      LEFT JOIN parishes pa ON v.parish_id = pa.id
      LEFT JOIN subcounties sc ON pa.subcounty_id = sc.id
      LEFT JOIN counties c ON sc.county_id = c.id
      LEFT JOIN districts d ON c.district_id = d.id
      WHERE s.school_id = ? AND s.status = 'active'
      GROUP BY d.id, d.name, c.id, c.name
      ORDER BY student_count DESC
      LIMIT 20
    `, [schoolId]);

    // Age distribution
    const ageDistribution = await connection.execute(`
      SELECT 
        CASE 
          WHEN YEAR(CURDATE()) - YEAR(STR_TO_DATE(p.date_of_birth, '%Y-%m-%d')) < 6 THEN 'Under 6'
          WHEN YEAR(CURDATE()) - YEAR(STR_TO_DATE(p.date_of_birth, '%Y-%m-%d')) BETWEEN 6 AND 10 THEN '6-10'
          WHEN YEAR(CURDATE()) - YEAR(STR_TO_DATE(p.date_of_birth, '%Y-%m-%d')) BETWEEN 11 AND 15 THEN '11-15'
          WHEN YEAR(CURDATE()) - YEAR(STR_TO_DATE(p.date_of_birth, '%Y-%m-%d')) BETWEEN 16 AND 20 THEN '16-20'
          ELSE 'Over 20'
        END as age_group,
        COUNT(s.id) as student_count,
        COUNT(CASE WHEN p.gender = 'M' THEN 1 END) as male_count,
        COUNT(CASE WHEN p.gender = 'F' THEN 1 END) as female_count
      FROM students s
      JOIN people p ON s.person_id = p.id
      WHERE s.school_id = ? AND s.status = 'active'
      AND p.date_of_birth IS NOT NULL
      GROUP BY age_group
      ORDER BY 
        CASE age_group
          WHEN 'Under 6' THEN 1
          WHEN '6-10' THEN 2
          WHEN '11-15' THEN 3
          WHEN '16-20' THEN 4
          ELSE 5
        END
    `, [schoolId]);

    await connection.end();

    return NextResponse.json({
      success: true,
      data: {
        enrollmentByClass: enrollmentByClass[0],
        newAdmissions: newAdmissions[0],
        dropoutAnalysis: dropoutAnalysis[0],
        retentionByYear: retentionByYear[0],
        geographicDistribution: geographicDistribution[0],
        ageDistribution: ageDistribution[0]
      }
    });
  } catch (error: any) {
    console.error('Error fetching enrollment analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
