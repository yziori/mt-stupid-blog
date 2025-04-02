import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * 日付を「YYYY.MM.DD」形式にフォーマットする
 * @param date ISO形式などの文字列 or Date型
 * @returns フォーマットされた日付文字列 例: "2025.04.01"
 */
export const formatToDotDate = (date: string | Date): string => {
	return dayjs(date).tz("Asia/Tokyo").format("YYYY.MM.DD");
};
