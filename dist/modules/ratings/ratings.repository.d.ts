export declare class RatingsRepository {
    findByDoctorAndPatient(doctorId: string, patientId: string): Promise<{
        id: string;
        createdAt: Date;
        rating: number;
        doctorId: string;
        patientId: string;
        comment: string | null;
    }>;
    upsert(doctorId: string, patientId: string, rating: number, comment?: string | null): Promise<{
        id: string;
        createdAt: Date;
        rating: number;
        doctorId: string;
        patientId: string;
        comment: string | null;
    }>;
    listByDoctor(doctorId: string, skip: number, limit: number): Promise<{
        items: ({
            patient: {
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            rating: number;
            doctorId: string;
            patientId: string;
            comment: string | null;
        })[];
        total: number;
    }>;
    syncDoctorAggregate(doctorId: string): Promise<{
        rating: number;
        ratingCount: number;
    }>;
    hasCompletedAppointment(patientId: string, doctorId: string): Promise<boolean>;
}
export declare const ratingsRepository: RatingsRepository;
