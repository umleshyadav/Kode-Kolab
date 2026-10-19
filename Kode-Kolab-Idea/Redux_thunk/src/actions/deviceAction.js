import axios from "axios";

export const fetchDevices = () => {
    return async (dispatch) =>{
        try{
            dispatch({type: "FETCH_DEVICES_REQUEST"});
            // Assuming you have set up axios instance in utils/axiosInstance.js
            const response =  await axios.get("devices");
       dispatch({
        type: "fetch_devices_success",
        payload: response.data, // payload should be the data from the response
        // payload: response.data.devices, // if the data is nested inside a 'devices' key
       });
    }catch(err){
        dispatch({
            type: "fetch_devices_dailure",
            payload: err.message,
        });
    }
};
};