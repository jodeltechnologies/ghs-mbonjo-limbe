-- Role assignments. Only the Principal is singular; every other post may be
-- held by several people at once, and each appointment carries dates so that
-- the system can answer what somebody held on a past date.
-- Run after 03-seed-data.sql. Safe to run more than once.

begin;

insert into role_assignments (staff_id, role, department, note, starts_on)
select s.id, v.role::staff_role, v.dept, v.note, date '2025-09-01'
from (values
  ('Aaron Manga Mongombe'::text,'vice_principal'::text,null::text,null::text),
  ('Agease Thérèse'::text,'pedagogic_animator'::text,'FRE'::text,null::text),
  ('Aguh Grace Mah'::text,'vice_principal'::text,null::text,'Guidance & Counselling, Home Economics'::text),
  ('Ako née Sande Else Eku'::text,'senior_discipline_master'::text,null::text,null::text),
  ('Akume née Epole Kome Gladis'::text,'hod'::text,null::text,'Department not named in the card index'::text),
  ('Alobwede née Epwene Emiline Dione'::text,'vice_principal'::text,null::text,'English Language, Literature in English'::text),
  ('Ashu Nelson Eyongechaw'::text,'hod'::text,null::text,'Department not named in the card index'::text),
  ('Azanji Agheenwi Zita Bih'::text,'hod'::text,null::text,'Department not named in the card index'::text),
  ('Chefor nee Atengong Eveline Tizimboh'::text,'senior_discipline_master'::text,null::text,null::text),
  ('David Moki Ndive'::text,'principal'::text,null::text,null::text),
  ('Dora Monjoa Lifanda epouse Woloa-Monono'::text,'vice_principal'::text,null::text,'Chemistry'::text),
  ('Ekwoge Francis Ndille'::text,'staff_social_president'::text,null::text,null::text),
  ('JAFF, nee Tangka Bertha Mokia'::text,'vice_principal'::text,null::text,'Literature in English'::text),
  ('Joana Evenye INDOKO, epse Alobwede'::text,'senior_discipline_master'::text,null::text,null::text),
  ('Maureen Eduke NGWESE, epse Lovet Eema Agbortabi'::text,'hod'::text,'GDC'::text,'Named in the specification'::text),
  ('Maureen Njomoh Carr'::text,'bursar'::text,null::text,null::text),
  ('Mbekem Anyi Sylvie NKENGAFAC, epse'::text,'hod'::text,null::text,'Department not named in the card index'::text),
  ('Ndambi Endah Akwi'::text,'hod'::text,null::text,'Department not named in the card index'::text),
  ('Ngwana Joshua Ngwana'::text,'hod'::text,null::text,'Department not named in the card index'::text),
  ('Njonje née Enowbisong Alice Bessem'::text,'hod'::text,null::text,'Department not named in the card index'::text),
  ('Njonje née Enowbisong Alice Bessem'::text,'guidance_counsellor'::text,null::text,null::text),
  ('Nkafu Margaret Atembe'::text,'hod'::text,null::text,'Department not named in the card index'::text),
  ('Nkamnye Walters Nomi'::text,'senior_discipline_master'::text,null::text,null::text),
  ('Nkwelle Rita Mekang'::text,'guidance_counsellor'::text,null::text,null::text),
  ('Shing Dieudonne Chia'::text,'senior_discipline_master'::text,null::text,null::text),
  ('Victoria EBUDE-NGOLE Mboge'::text,'hod'::text,null::text,'Department not named in the card index'::text),
  ('Wamba Nkengafac Thomas'::text,'senior_discipline_master'::text,null::text,null::text),
  ('Wango Ivan Fermboh'::text,'hod'::text,null::text,'Department not named in the card index'::text)
) as v(name, role, dept, note)
join staff s on s.display_name = v.name
where not exists (
  select 1 from role_assignments ra
  where ra.staff_id = s.id and ra.role = v.role::staff_role and ra.ends_on is null
    and ra.department is not distinct from v.dept);

commit;

-- Ten Heads of Department are seeded with no department named, as Part 12 of the
-- specification asks. The Principal completes them from the Departments screen.
select role, count(*) from role_assignments where ends_on is null group by role order by role;