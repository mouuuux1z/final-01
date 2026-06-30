import { EntityStatus } from '@prisma/client';

import { prisma } from '../../config/database.js';

import type { PaginationParams } from '../../utils/pagination.js';



const doctorSelect = {

  id: true,

  name: true,

  email: true,

  specialization: true,

  phone: true,

  city: true,

  location: true,

  status: true,

  isOnline: true,

  serialNumber: true,

  rating: true,

  ratingCount: true,

  disableReason: true,

  description: true,

  createdAt: true,

} as const;



export class ClinicsRepository {

  async findById(id: string) {

    return prisma.clinic.findUnique({

      where: { id },

      include: {

        doctors: {

          select: doctorSelect,

          orderBy: { createdAt: 'asc' },

        },

        _count: { select: { doctors: true } },

      },

    });

  }



  async update(
    id: string,
    data: {
      name?: string;
      location?: string;
      phone?: string;
      city?: string;
      specialization?: string;
      status?: string;
    },
  ) {

    return prisma.clinic.update({

      where: { id },

      data: data as never,

        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          location: true,
          city: true,
          specialization: true,
          certificate: true,
          status: true,
          createdAt: true,
        },

    });

  }



  async findMany(pagination: PaginationParams, status?: EntityStatus) {

    const where = status ? { status } : {};

    const [items, total] = await Promise.all([

      prisma.clinic.findMany({

        where,

        skip: pagination.skip,

        take: pagination.limit,

        orderBy: { createdAt: 'desc' },

        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          location: true,
          city: true,
          specialization: true,
          certificate: true,
          status: true,
          createdAt: true,
          _count: { select: { doctors: true } },
        },

      }),

      prisma.clinic.count({ where }),

    ]);

    return { items, total };

  }



  async findDoctorById(doctorId: string) {

    return prisma.doctor.findUnique({

      where: { id: doctorId },

      select: { id: true, clinicId: true, email: true, status: true },

    });

  }



  async createDoctor(data: {
    serialNumber: string;
    name: string;
    email: string;
    password: string;
    phone: string;
    specialization: string;
    city: string;
    location?: string;
    clinicInfo?: string;
    description?: string;
    certificate?: string;
    clinicId: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const doctor = await tx.doctor.create({
        data: {
          ...data,
          status: EntityStatus.ACTIVE,
        },
        select: doctorSelect,
      });

      return doctor;
    });
  }



  async assignDoctor(clinicId: string, doctorId: string) {

    return prisma.doctor.update({

      where: { id: doctorId },

      data: { clinicId },

      select: doctorSelect,

    });

  }



  async updateDoctorStatus(

    clinicId: string,

    doctorId: string,

    status: 'ACTIVE' | 'DISABLED',

    disableReason?: string | null,

  ) {

    return prisma.doctor.updateMany({

      where: { id: doctorId, clinicId },

      data: {
        status,
        disableReason: status === EntityStatus.DISABLED ? disableReason ?? null : null,
        ...(status === EntityStatus.DISABLED ? { isOnline: false } : {}),
      },

    });

  }



  async getDoctorInClinic(clinicId: string, doctorId: string) {

    return prisma.doctor.findFirst({

      where: { id: doctorId, clinicId },

      select: doctorSelect,

    });

  }



  async removeDoctor(clinicId: string, doctorId: string) {

    return prisma.doctor.updateMany({

      where: { id: doctorId, clinicId },

      data: { clinicId: null },

    });

  }



  async getNextDoctorSerialNumber(): Promise<string> {

    const count = await prisma.doctor.count();

    const year = new Date().getFullYear();

    return `DOC-${year}-${String(count + 1).padStart(3, '0')}`;

  }



  async emailExists(email: string): Promise<boolean> {

    const doctor = await prisma.doctor.findUnique({ where: { email } });

    return doctor !== null;

  }

}



export const clinicsRepository = new ClinicsRepository();

