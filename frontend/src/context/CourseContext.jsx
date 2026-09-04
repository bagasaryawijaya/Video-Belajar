import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getCourses as getCoursesApi,
  getCourseById as getCourseByIdApi,
  addCourse as addCourseApi,
  updateCourse as updateCourseApi,
  deleteCourse as deleteCourseApi,
} from "../services/api";
import { slugify } from "../utils/slug";
import {
  setCourses,
  addCourseToStore,
  updateCourseInStore,
  deleteCourseFromStore,
} from "../store/redux/courseReducer";

const CourseContext = createContext(null);

export function CourseProvider({ children }) {
  const dispatch = useDispatch();
  const courses = useSelector((state) => state.courses);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usingFallback, setUsingFallback] = useState(false);

  const getCourses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getCoursesApi();
      dispatch(setCourses(data));
      setUsingFallback(false);
      return data;
    } catch (err) {
      // Course hanya berasal dari Firebase melalui API; jangan tampilkan data demo/localStorage.
      dispatch(setCourses([]));
      setUsingFallback(false);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    getCourses();
  }, [getCourses]);

  const getCourseById = useCallback(async (id) => {
    try {
      return await getCourseByIdApi(id);
    } catch {
      return courses.find((course) => String(course.id) === String(id)) || null;
    }
  }, [courses]);

  const addCourse = async (course) => {
    const payload = { ...course, slug: slugify(course.title), rating: Number(course.rating) || 0, reviews: Number(course.reviews) || 0, price: Number(course.price) || 0 };
    try {
      const newCourse = await addCourseApi(payload);
      dispatch(addCourseToStore(newCourse));
      return newCourse;
    } catch (error) {
      throw error;
    }
  };

  const updateCourse = async (id, courseData) => {
    const payload = { ...courseData, slug: slugify(courseData.title), rating: Number(courseData.rating) || 0, reviews: Number(courseData.reviews) || 0, price: Number(courseData.price) || 0 };
    try {
      const updatedCourse = await updateCourseApi(id, payload);
      dispatch(updateCourseInStore(updatedCourse));
      return updatedCourse;
    } catch (error) {
      throw error;
    }
  };

  const deleteCourse = async (id) => {
    await deleteCourseApi(id);
    dispatch(deleteCourseFromStore(id));
  };

  return (
    <CourseContext.Provider
      value={{
        courses,
        loading,
        error,
        usingFallback,
        getCourses,
        getCourseById,
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
  const context = useContext(CourseContext);
  if (!context) throw new Error("useCourses harus digunakan di dalam CourseProvider");
  return context;
}
