const initialState = [];

export const SET_COURSES = "courses/setCourses";
export const ADD_COURSE = "courses/addCourse";
export const UPDATE_COURSE = "courses/updateCourse";
export const DELETE_COURSE = "courses/deleteCourse";

export const setCourses = (courses) => ({
  type: SET_COURSES,
  payload: Array.isArray(courses) ? courses : [],
});

export const addCourseToStore = (course) => ({
  type: ADD_COURSE,
  payload: course,
});

export const updateCourseInStore = (course) => ({
  type: UPDATE_COURSE,
  payload: course,
});

export const deleteCourseFromStore = (id) => ({
  type: DELETE_COURSE,
  payload: id,
});

// Reducer data API: menyimpan hasil GET/ADD/EDIT/DELETE API
// ke dalam state global Redux.
const courseReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_COURSES:
      return action.payload;

    case ADD_COURSE:
      return [...state, action.payload];

    case UPDATE_COURSE:
      return state.map((course) =>
        String(course.id) === String(action.payload.id)
          ? action.payload
          : course
      );

    case DELETE_COURSE:
      return state.filter(
        (course) => String(course.id) !== String(action.payload)
      );

    default:
      return state;
  }
};

export default courseReducer;
