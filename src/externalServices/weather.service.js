import axios from 'axios';
import moment from 'moment';

const http = axios.create({
  baseURL: process.env.API_BASE_URL,
  timeout: process.env.API_TIMEOUT,
});

export const getWeatherHistoryData = async (location) => {
  var now = moment();
  var todayDate = now.format('YYYY-MM-DD');
  var startDate = now
    .clone()
    .subtract(process.env.SUMMARY_PERIOD, 'day')
    .format('YYYY-MM-DD');

  console.log(
    'Arguements for Weather API: ' +
      location +
      ' Date from: ' +
      startDate +
      ' to: ' +
      todayDate,
  );
  return http.get(
    `rest/services/timeline/${location}/${startDate}/${todayDate}`,
    {
      params: {
        key: process.env.WEATHER_API_KEY,
      },
    },
  );
};
