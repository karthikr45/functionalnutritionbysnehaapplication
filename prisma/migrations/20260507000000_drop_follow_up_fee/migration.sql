-- Drop the followUpFee column from DoctorProfile.
-- Only consultationFee is supported now. The FOLLOW_UP enum value on
-- AppointmentType is kept (Postgres enum value removal is non-trivial)
-- but no new appointments of that type can be created from the UI.
ALTER TABLE "DoctorProfile" DROP COLUMN "followUpFee";
