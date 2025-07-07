import "./style.css";

/**
 * Typ för kursinformation
 */
interface Course {
  code: string; // Kurskod
  name: string; // Kursnamn
  progression: "A" | "B" | "C"; // Progression
  syllabus: string; // Länk till kursplan
}

// MENY OCH NAVIGATION

/**
 * Visar vald sektion och uppdaterar aktiv länk i menyn
 */
function showSection(sectionId: string): void {
  // Dölj alla sektioner
  const sections = document.querySelectorAll(".section");
  sections.forEach((section) => section.classList.remove("active"));

  // Visa vald sektion
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.add("active");
  }

  // Uppdatera aktiv länk i menyn
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => link.classList.remove("active"));

  const activeLink = document.querySelector(`[href="#${sectionId}"]`);
  if (activeLink) {
    activeLink.classList.add("active");
  }
}

/**
 * Växlar visning av mobilmenyn (hamburger)
 */
function toggleMobileMenu(): void {
  const navMenu = document.querySelector(".nav-menu") as HTMLElement;
  const hamburger = document.querySelector(".hamburger") as HTMLElement;

  if (navMenu && hamburger) {
    navMenu.classList.toggle("open");
    hamburger.classList.toggle("active");
  }
}

/**
 * Initierar menyrelaterade event listeners (navigation och hamburger-meny)
 */
function initMenu(): void {
  // Navigationslänkar - visa rätt sektion vid klick
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const href = (e.target as HTMLAnchorElement).getAttribute("href");
      if (href) {
        const sectionId = href.substring(1); // Ta bort #
        showSection(sectionId);
        // Stäng mobilmeny om den är öppen
        const navMenu = document.querySelector(".nav-menu");
        if (navMenu?.classList.contains("open")) {
          toggleMobileMenu();
        }
      }
    });
  });

  // Hamburger-meny för mobil
  const hamburger = document.querySelector(".hamburger");
  if (hamburger) {
    hamburger.addEventListener("click", toggleMobileMenu);
  }
}

// DATAHANTERING

/**
 * hämtar alla kurser från localStorage
 */
function loadCoursesFromStorage(): Course[] {
  const data = localStorage.getItem("courses");
  return data ? JSON.parse(data) : [];
}

/**
 * Sparar kurser till localStorage
 */
function saveCoursesToStorage(courses: Course[]): void {
  localStorage.setItem("courses", JSON.stringify(courses));
}

/**
 * Tar bort en kurs utifrån kurskod
 */
function deleteCourseByCode(courseCode: string): void {
  if (confirm(`Är du säker på att du vill ta bort kursen ${courseCode}?`)) {
    const courses = loadCoursesFromStorage();
    const updatedCourses = courses.filter((c) => c.code !== courseCode);
    saveCoursesToStorage(updatedCourses);
    updateCourseListUI();
  }
}

// RENDERING

/**
 * Uppdaterar kurslistan i DOM:en:
 * tömmer listan och lägger till alla aktuella kurser från localStorage
 * visar meddelande om inga kurser finns, annars visar kurslistan
 */
function updateCourseListUI(): void {
  const courses = loadCoursesFromStorage();
  const courseListElement = document.getElementById(
    "course-list"
  ) as HTMLUListElement;
  const noCoursesMessage = document.getElementById(
    "no-courses"
  ) as HTMLDivElement;

  if (!courseListElement || !noCoursesMessage) return;

  courseListElement.innerHTML = "";

  if (courses.length === 0) {
    noCoursesMessage.style.display = "block";
    courseListElement.style.display = "none";
  } else {
    noCoursesMessage.style.display = "none";
    courseListElement.style.display = "block";

    courses.forEach((course) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="course-content">
          <strong>${course.code}</strong>: ${course.name} (${course.progression})
          <br><a href="${course.syllabus}" target="_blank">Kursplan</a>
        </div>
        <button onclick="deleteCourseByCode('${course.code}')" class="btn-remove" title="Ta bort kurs">
          ✕
        </button>
      `;
      courseListElement.appendChild(li);
    });
  }
}

// FORMULÄRHANTERING

/**
 * Lägger till en kurs efter validering
 * returnerar true om kursen lades till, annars false
 */
function addNewCourse(course: Course): boolean {
  const courses = loadCoursesFromStorage();

  // Kontrollera att kurskoden är unik
  if (courses.some((c) => c.code === course.code)) {
    alert("Kurskoden måste vara unik!");
    return false;
  }

  // Kontrollera progresssion
  if (!["A", "B", "C"].includes(course.progression)) {
    alert("Progression måste vara A, B eller C!");
    return false;
  }

  courses.push(course);
  saveCoursesToStorage(courses);
  updateCourseListUI();
  return true;
}

/**
 * Hanterar formulärets "submit-event"
 */
function onCourseFormSubmit(event: Event): void {
  event.preventDefault();

  const courseFormElement = event.target as HTMLFormElement;
  const formData = new FormData(courseFormElement);

  const course: Course = {
    code: (formData.get("code") as string).trim(),
    name: (formData.get("name") as string).trim(),
    progression: formData.get("progression") as "A" | "B" | "C",
    syllabus: (formData.get("syllabus") as string).trim(),
  };

  if (addNewCourse(course)) {
    courseFormElement.reset();
    showSection("courses"); // Visa kurslistan efter att kurs lagts till
    alert("Kurs tillagd framgångsrikt!");
  }
}

//INITIERING

/**
 * Initierar applikationen och kopplar event listeners
 */
function initApp(): void {
  // Initiera meny och navigation
  initMenu();

  // Info-kort - navigera till sektioner vid klick
  const infoCards = document.querySelectorAll(".info-card");
  infoCards.forEach((card, index) => {
    card.addEventListener("click", () => {
      switch (index) {
        case 0: // "Lägg till kurser"
          showSection("add-course");
          break;
        case 1: // "Visa kurser"
          showSection("courses");
          break;
      }
    });
  });

  // Formulär - lägg till kurs
  const courseFormElement = document.getElementById(
    "course-form"
  ) as HTMLFormElement;
  if (courseFormElement) {
    courseFormElement.addEventListener("submit", onCourseFormSubmit);
  }

  // rendera kurser vid start
  updateCourseListUI();

  // gör deleteCourseByCode tillgänglig globalt (för onclick i HTML)
  (window as any).deleteCourseByCode = deleteCourseByCode;
}

// Starta applikationen när DOM är redo
// (initApp kopplar ihop all funktionalitet)
document.addEventListener("DOMContentLoaded", initApp);
