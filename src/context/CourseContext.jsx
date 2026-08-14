import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  getCourses as getCoursesApi,
  addCourse as addCourseApi,
  updateCourse as updateCourseApi,
  deleteCourse as deleteCourseApi,
} from "../services/api";

const CourseContext = createContext();

export function CourseProvider({ children }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // GET
  const getCourses = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getCoursesApi();
      setCourses(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Ambil data dari MockAPI ketika aplikasi pertama kali dibuka
  useEffect(() => {
    getCourses().catch(() => {
      // Error sudah disimpan di state error.
    });
  }, [getCourses]);

  // ADD
  const addCourse = async (course) => {
    setError("");

    try {
      const newCourse = await addCourseApi({
        ...course,
        rating: Number(course.rating) || 0,
        reviews: Number(course.reviews) || 0,
        price: Number(course.price) || 0,
      });

      setCourses((prev) => [...prev, newCourse]);
      return newCourse;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // UPDATE
  const updateCourse = async (id, courseData) => {
    setError("");

    try {
      const updatedCourse = await updateCourseApi(id, {
        ...courseData,
        rating: Number(courseData.rating) || 0,
        reviews: Number(courseData.reviews) || 0,
        price: Number(courseData.price) || 0,
      });

      setCourses((prev) =>
        prev.map((course) =>
          String(course.id) === String(id) ? updatedCourse : course
        )
      );

      return updatedCourse;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // DELETE
  const deleteCourse = async (id) => {
    setError("");

    try {
      await deleteCourseApi(id);

      setCourses((prev) =>
        prev.filter((course) => String(course.id) !== String(id))
      );
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return (
    <CourseContext.Provider
      value={{
        courses,
        loading,
        error,
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
