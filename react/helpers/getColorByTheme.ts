import { colors } from "../../constants/colors"

const getColorByTheme = (theme : "dark" | "light") => 
    theme === "dark" ? colors.black : colors.white

export default getColorByTheme