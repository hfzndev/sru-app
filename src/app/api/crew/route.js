import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import CrewSection from "@/models/CrewSection";

const defaultCrewData = [
  {
    sectionId: 'harian',
    name: 'Harian',
    sub: 'Daily Workers',
    workers: [
      { id: 'h1', name: 'Gondo Pramono', role: 'Section Head SRU & IPAL', type: 'Organik', status: 'present' },
      { id: 'h2', name: 'Aziz Saefur Rahman', role: 'Sr. Supervisor LPG & SRU', type: 'Organik', status: 'present' },
      { id: 'h3', name: 'Ahmad Djuhaeri', role: 'Sr. Supervisor IPAL & WWT', type: 'Organik', status: 'present' },
      { id: 'h4', name: 'Teguh Asmara', role: 'Sr. Supervisor Facility', type: 'Organik', status: 'present' },
      { id: 'h5', name: 'Ibnu Fadillah', role: 'Administrator', type: 'Organik', status: 'present' },
      { id: 'h6', name: 'Sapto', role: 'Administrator', type: 'TKJP', status: 'present' },
      { id: 'h7', name: 'Eko Wahyu', role: 'HSE Compliance', type: 'Organik', status: 'present' },
      { id: 'h8', name: 'Viki', role: 'Cleaner', type: 'TKJP', status: 'present' },
      { id: 'h9', name: 'Bilal', role: 'Cleaner', type: 'TKJP', status: 'present' },
      { id: 'h10', name: 'Isarotul', role: 'Driver', type: 'TKJP', status: 'present' }
    ]
  },
  {
    sectionId: 'shift-a',
    name: 'Shift A',
    sub: 'Operations Shift',
    workers: [
      { id: 'a1', name: 'Endra Kurniawan', role: 'Shift Supervisor SRU', type: 'Organik', status: 'present' },
      { id: 'a2', name: 'Eka Wahyu Widodo', role: 'Shift Supervisor IPAL', type: 'Organik', status: 'present' },
      { id: 'a3', name: 'Inmas Andhika Yomi', role: 'Panelman', type: 'Organik', status: 'present' },
      { id: 'a4', name: 'M. Sofyan Assauri', role: 'Panelman', type: 'Organik', status: 'present' },
      { id: 'a5', name: 'Ichsan Adiutomo', role: 'Operator', type: 'Organik', status: 'present' },
      { id: 'a6', name: 'Antonius Dwi Pamungkas', role: 'Operator', type: 'Organik', status: 'present' },
      { id: 'a7', name: 'Kutut Bayu Purwoko', role: 'Operator', type: 'Organik', status: 'present' },
      { id: 'a8', name: 'Alif Nur', role: 'Operator', type: 'Organik', status: 'present' },
      { id: 'a9', name: 'Sudarno', role: 'Operator', type: 'TKJP', status: 'present' },
      { id: 'a10', name: 'Karyanto', role: 'Operator', type: 'TKJP', status: 'present' },
    ]
  },
  {
    sectionId: 'shift-b',
    name: 'Shift B',
    sub: 'Operations Shift',
    workers: [
      { id: 'b1', name: 'Robit Ichwanudin', role: 'Shift Supervisor SRU', type: 'Organik', status: 'present' },
      { id: 'b2', name: 'Lukman Hakim Maolana', role: 'Shift Supervisor IPAL', type: 'Organik', status: 'present' },
      { id: 'b3', name: 'Akhmad Ryan Hutomo', role: 'Panelman', type: 'Organik', status: 'present' },
      { id: 'b4', name: 'Krisyoto', role: 'Panelman', type: 'Organik', status: 'present' },
      { id: 'b5', name: 'Nurdiyansari', role: 'Operator', type: 'Organik', status: 'present' },
      { id: 'b6', name: 'Nik Abdul Aziz Massal', role: 'Operator', type: 'Organik', status: 'present' },
      { id: 'b7', name: 'Diqa Nanda Abiyasa R.', role: 'Operator', type: 'Organik', status: 'present' },
      { id: 'b8', name: 'M. Imam Firmansyah', role: 'Operator', type: 'Organik', status: 'present' },
      { id: 'b9', name: 'Roni Martono', role: 'Operator', type: 'TKJP', status: 'present' },
      { id: 'b10', name: 'Carmadi', role: 'Operator', type: 'TKJP', status: 'present' },
    ]
  },
  {
    sectionId: 'shift-c',
    name: 'Shift C',
    sub: 'Operations Shift',
    workers: [
      { id: 'c1', name: 'Siyam Prayitno', role: 'Shift Supervisor SRU', type: 'Organik', status: 'present' },
      { id: 'c2', name: 'M. Yahya Nashiruddin', role: 'Shift Supervisor IPAL', type: 'Organik', status: 'present' },
      { id: 'c3', name: 'Achmad Setyoaji', role: 'Panelman', type: 'Organik', status: 'present' },
      { id: 'c4', name: 'M. Syakriun Niam', role: 'Panelman', type: 'Organik', status: 'present' },
      { id: 'c5', name: 'Ripa Mardiana', role: 'Operator', type: 'Organik', status: 'present' },
      { id: 'c6', name: 'M. Filza Maulana Fahmi', role: 'Operator', type: 'Organik', status: 'present' },
      { id: 'c7', name: 'Hafiz Norman', role: 'Operator', type: 'Organik', status: 'present' },
      { id: 'c9', name: 'Zunanto', role: 'Operator', type: 'TKJP', status: 'present' },
      { id: 'c10', name: 'Suprijadi', role: 'Operator', type: 'TKJP', status: 'present' },
      { id: 'c11', name: 'Himamudin', role: 'Operator', type: 'TKJP', status: 'present' },
      { id: 'c12', name: 'Sunarso', role: 'Operator', type: 'TKJP', status: 'present' },
    ]
  },
  {
    sectionId: 'shift-d',
    name: 'Shift D',
    sub: 'Operations Shift',
    workers: [
      { id: 'd1', name: 'Driyanto', role: 'Shift Supervisor SRU', type: 'Organik', status: 'present' },
      { id: 'd2', name: 'Yusuf Supriadi', role: 'Shift Supervisor IPAL', type: 'Organik', status: 'present' },
      { id: 'd3', name: 'M. Dede Abdurakhman', role: 'Panelman', type: 'Organik', status: 'present' },
      { id: 'd4', name: 'Adtya Permana I.', role: 'Panelman', type: 'Organik', status: 'present' },
      { id: 'd5', name: 'Fariz Rachman Hakim', role: 'Operator', type: 'Organik', status: 'present' },
      { id: 'd6', name: 'M. Dio Fajar Sidik', role: 'Operator', type: 'Organik', status: 'present' },
      { id: 'd7', name: 'Rizki Nur Aziz', role: 'Operator', type: 'Organik', status: 'present' },
      { id: 'd8', name: 'Pandu Dian Nugraha', role: 'Operator', type: 'Organik', status: 'present' },
      { id: 'd9', name: 'Robertus Prasetyo', role: 'Operator', type: 'TKJP', status: 'present' },
      { id: 'd10', name: 'Yatiman', role: 'Operator', type: 'TKJP', status: 'present' },
    ]
  }
];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();
    let sections = await CrewSection.find({});

    if (sections.length === 0) {
      console.log("Empty Crew DB. Seeding default factory data...");
      await CrewSection.insertMany(defaultCrewData);
      sections = await CrewSection.find({});
    }

    return NextResponse.json(sections, { status: 200 });
  } catch (error) {
    console.error("GET Crew Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role === "pending") {
      return NextResponse.json({ message: "Unauthorized. Admin only." }, { status: 403 });
    }

    const payload = await req.json();
    await dbConnect();

    // STATUS UPDATE PATH
    if (payload.action === 'update_status') {
      const { sectionId, workerId, newStatus } = payload;
      
      const targetSection = await CrewSection.findOne({ sectionId });
      if (!targetSection) return NextResponse.json({ message: "Section not found." }, { status: 404 });
      
      const worker = targetSection.workers.find(w => w.id === workerId);
      if (!worker) return NextResponse.json({ message: "Worker not found." }, { status: 404 });
      
      worker.status = newStatus;
      await targetSection.save();
      
      return NextResponse.json({ message: "Status updated", section: targetSection }, { status: 200 });
    }

    // PROFILE UPDATE PATH
    if (payload.action === 'update_profile') {
      const { sectionId, workerId, name, role, type } = payload;
      
      const targetSection = await CrewSection.findOne({ sectionId });
      if (!targetSection) return NextResponse.json({ message: "Section not found." }, { status: 404 });
      
      const worker = targetSection.workers.find(w => w.id === workerId);
      if (!worker) return NextResponse.json({ message: "Worker not found." }, { status: 404 });
      
      if (name) worker.name = name;
      if (role) worker.role = role;
      if (type) worker.type = type;

      await targetSection.save();
      
      return NextResponse.json({ message: "Profile updated", section: targetSection }, { status: 200 });
    }

    // SHIFT MOVE PATH
    if (payload.action === 'move_worker') {
      const { fromSectionId, toSectionId, workerId } = payload;
      
      if (fromSectionId === toSectionId) {
        return NextResponse.json({ message: "Worker is already in that shift." }, { status: 400 });
      }

      const fromSection = await CrewSection.findOne({ sectionId: fromSectionId });
      const toSection = await CrewSection.findOne({ sectionId: toSectionId });
      
      if (!fromSection || !toSection) {
        return NextResponse.json({ message: "Source or Target shift not found." }, { status: 404 });
      }

      const workerIndex = fromSection.workers.findIndex(w => w.id === workerId);
      if (workerIndex === -1) {
        return NextResponse.json({ message: "Worker not found in source shift." }, { status: 404 });
      }

      // Extract worker
      const movingWorker = fromSection.workers[workerIndex].toObject();
      
      // Pull from original
      fromSection.workers.splice(workerIndex, 1);
      
      // Push to new
      toSection.workers.push(movingWorker);

      await fromSection.save();
      await toSection.save();
      
      return NextResponse.json({ message: "Worker moved successfully.", sections: [fromSection, toSection] }, { status: 200 });
    }

    return NextResponse.json({ message: "Invalid action." }, { status: 400 });

  } catch (error) {
    console.error("PUT Crew Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role === "pending") {
      return NextResponse.json({ message: "Unauthorized. Admin only." }, { status: 403 });
    }

    const { sectionId, worker } = await req.json();

    if (!sectionId || !worker?.name || !worker?.role || !worker?.type) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    await dbConnect();

    const section = await CrewSection.findOne({ sectionId });
    if (!section) {
      return NextResponse.json({ message: "Section not found." }, { status: 404 });
    }

    // Generate a unique ID based on sectionId + timestamp
    const newId = `${sectionId}-${Date.now()}`;

    section.workers.push({
      id: newId,
      name: worker.name,
      role: worker.role,
      type: worker.type,
      status: 'present',
    });

    await section.save();

    return NextResponse.json({ message: "Worker added successfully.", section }, { status: 201 });
  } catch (error) {
    console.error("POST Crew Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
