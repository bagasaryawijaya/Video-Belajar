import { createContext, useContext, useEffect, useState } from "react";
import defaultCourses from "../data/courses";

const CourseContext = createContext();
const COURSES_KEY = "videoBelajarCourses";

export function CourseProvider({ children }) {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(COURSES_KEY));

      if (Array.isArray(saved)) {
        setCourses(saved);
      } else {
        localStorage.setItem(COURSES_KEY, JSON.stringify(defaultCourses));
        setCourses(defaultCourses);
      }
    } catch {
      localStorage.setItem(COURSES_KEY, JSON.stringify(defaultCourses));
      setCourses(defaultCourses);
    }
  }, []);

  // GET
  const getCourses = () => courses;

  // ADD
  const addCourse = (course) => {
    const newCourse = {
      ...course,
      id: Date.now(),
      rating: Number(course.rating) || 0,
      reviews: Number(course.reviews) || 0,
      price: Number(course.price) || 0,
    };

    const updated = [...courses, newCourse];
    setCourses(updated);
    localStorage.setItem(COURSES_KEY, JSON.stringify(updated));

    return newCourse;
  };

  // UPDATE
  const updateCourse = (id, courseData) => {
    const updated = courses.map((course) =>
      course.id === id
        ? {
            ...course,
            ...courseData,
            id,
            rating: Number(courseData.rating ?? course.rating) || 0,
            reviews: Number(courseData.reviews ?? course.reviews) || 0,
            price: Number(courseData.price ?? course.price) || 0,
          }
        : course
    );

    setCourses(updated);
    localStorage.setItem(COURSES_KEY, JSON.stringify(updated));
  };

  // DELETE
  const deleteCourse = (id) => {
    const updated = courses.filter((course) => course.id !== id);

    setCourses(updated);
    localStorage.setItem(COURSES_KEY, JSON.stringify(updated));
  };

  return (
    <CourseContext.Provider
      value={{
        courses,
        getCourses,
        addCourse,
        updateCourse,
        deleteCourse,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
}

export function useCourses() {
  return useContext(CourseContext);
}
