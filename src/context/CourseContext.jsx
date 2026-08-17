import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getCourses as getCoursesApi,
  addCourse as addCourseApi,
  updateCourse as updateCourseApi,
  deleteCourse as deleteCourseApi,
} from "../services/api";
import {
  setCourses,
  addCourseToStore,
  updateCourseInStore,
  deleteCourseFromStore,
} from "../store/redux/courseReducer";

const CourseContext = createContext();

export function CourseProvider({ children }) {
  const dispatch = useDispatch();
  const courses = useSelector((state) => state.courses);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // GET API -> Redux
  const getCourses = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getCoursesApi();
      dispatch(setCourses(data));
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    getCourses().catch(() => {
      // Error sudah disimpan di state error.
    });
  }, [getCourses]);

  // ADD API -> Redux
  const addCourse = async (course) => {
    setError("");

    try {
      const newCourse = await addCourseApi({
        ...course,
        rating: Number(course.rating) || 0,
        reviews: Number(course.reviews) || 0,
        price: Number(course.price) || 0,
      });

      dispatch(addCourseToStore(newCourse));
      return newCourse;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // EDIT API -> Redux
  const updateCourse = async (id, courseData) => {
    setError("");

    try {
      const updatedCourse = await updateCourseApi(id, {
        ...courseData,
        rating: Number(courseData.rating) || 0,
        reviews: Number(courseData.reviews) || 0,
        price: Number(courseData.price) || 0,
      });

      dispatch(updateCourseInStore(updatedCourse));
      return updatedCourse;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // DELETE API -> Redux
  const deleteCourse = async (id) => {
    setError("");

    try {
      await deleteCourseApi(id);
      dispatch(deleteCourseFromStore(id));
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
