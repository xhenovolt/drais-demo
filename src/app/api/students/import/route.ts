import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import * as XLSX from 'xlsx';

interface ImportStudent {
  first_name: string;
  last_name: string;
  other_name?: string;
  gender?: string;
  date_of_birth?: string;
  phone?: string;
  email?: string;
  address?: string;
  class_name?: string;
  stream_name?: string;
  district_name?: string;
  village_name?: string;
  status?: string;
}

export async function POST(request: NextRequest) {
  let connection;
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file provided'
      }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid file type. Please upload Excel (.xlsx, .xls) or CSV files only.'
      }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    let data: any[];

    try {
      if (file.type === 'text/csv') {
        // Handle CSV
        const text = new TextDecoder().decode(buffer);
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        data = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = values[index] || '';
          });
          return obj;
        });
      } else {
        // Handle Excel
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        data = XLSX.utils.sheet_to_json(worksheet);
      }
    } catch (parseError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to parse file. Please check the file format.'
      }, { status: 400 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'File is empty or contains no valid data'
      }, { status: 400 });
    }

    connection = await getConnection();

    // Fetch existing classes and streams for validation
    const [classes] = await connection.execute('SELECT id, name FROM classes');
    const [streams] = await connection.execute('SELECT id, name FROM streams');
    const [districts] = await connection.execute('SELECT id, name FROM districts');
    const [villages] = await connection.execute('SELECT id, name FROM villages');

    const classMap = new Map((classes as any[]).map(c => [c.name.toLowerCase(), c.id]));
    const streamMap = new Map((streams as any[]).map(s => [s.name.toLowerCase(), s.id]));
    const districtMap = new Map((districts as any[]).map(d => [d.name.toLowerCase(), d.id]));
    const villageMap = new Map((villages as any[]).map(v => [v.name.toLowerCase(), v.id]));

    const results = {
      total: data.length,
      successful: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 2; // +2 because Excel starts at 1 and we skip header

      try {
        // Map different possible column names
        const student: ImportStudent = {
          first_name: row['First Name'] || row['first_name'] || row['firstname'] || '',
          last_name: row['Last Name'] || row['last_name'] || row['lastname'] || '',
          other_name: row['Other Name'] || row['other_name'] || row['othername'] || '',
          gender: row['Gender'] || row['gender'] || '',
          date_of_birth: row['Date of Birth'] || row['date_of_birth'] || row['dob'] || '',
          phone: row['Phone'] || row['phone'] || row['contact'] || '',
          email: row['Email'] || row['email'] || '',
          address: row['Address'] || row['address'] || '',
          class_name: row['Class'] || row['class_name'] || row['class'] || '',
          stream_name: row['Stream'] || row['stream_name'] || row['stream'] || '',
          district_name: row['District'] || row['district_name'] || row['district'] || '',
          village_name: row['Village'] || row['village_name'] || row['village'] || '',
          status: row['Status'] || row['status'] || 'active'
        };

        // Validate required fields
        if (!student.first_name || !student.last_name) {
          results.errors.push(`Row ${rowNum}: First name and last name are required`);
          results.failed++;
          continue;
        }

        // Validate and convert foreign keys
        const class_id = student.class_name ? classMap.get(student.class_name.toLowerCase()) : null;
        const stream_id = student.stream_name ? streamMap.get(student.stream_name.toLowerCase()) : null;
        const district_id = student.district_name ? districtMap.get(student.district_name.toLowerCase()) : null;
        const village_id = student.village_name ? villageMap.get(student.village_name.toLowerCase()) : null;

        // Validate date format
        let formattedDate = null;
        if (student.date_of_birth) {
          const date = new Date(student.date_of_birth);
          if (isNaN(date.getTime())) {
            results.errors.push(`Row ${rowNum}: Invalid date format for date of birth`);
            results.failed++;
            continue;
          }
          formattedDate = date.toISOString().split('T')[0];
        }

        // Validate gender
        if (student.gender && !['M', 'F', 'male', 'female'].includes(student.gender.toLowerCase())) {
          results.errors.push(`Row ${rowNum}: Invalid gender value. Use M/F or male/female`);
          results.failed++;
          continue;
        }

        const gender = student.gender ? (student.gender.toLowerCase().startsWith('m') ? 'M' : 'F') : null;

        // Insert student
        const [insertResult] = await connection.execute(`
          INSERT INTO students (
            first_name, last_name, other_name, gender, date_of_birth,
            phone, email, address, class_id, stream_id, district_id, village_id,
            status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
          student.first_name.trim(),
          student.last_name.trim(),
          student.other_name?.trim() || null,
          gender,
          formattedDate,
          student.phone?.trim() || null,
          student.email?.trim() || null,
          student.address?.trim() || null,
          class_id,
          stream_id,
          district_id,
          village_id,
          student.status || 'active'
        ]);

        results.successful++;

      } catch (rowError: any) {
        console.error(`Error processing row ${rowNum}:`, rowError);
        results.errors.push(`Row ${rowNum}: ${rowError.message}`);
        results.failed++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import completed: ${results.successful} successful, ${results.failed} failed`,
      data: results
    });

  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to import students data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (closeError) {
        console.error('Error closing connection:', closeError);
      }
    }
  }
}
