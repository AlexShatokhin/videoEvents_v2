import { useEffect } from "react";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../types/RootStackParamList";
import logic from "../modules/logic/logic";
import { useTypedSelector } from "./useRedux";
import { Alert } from "react-native";

export const useConnectionCheck = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { ip, userName, password } = useTypedSelector(state => state.authorizationReducer);
    const { checkConnection } = logic(ip, userName, password);

    useEffect(() => {
        let controller: AbortController;

        const performConnectionCheck = async () => {
            controller = new AbortController();
            const timeout = 5000;

            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => {
                    console.log("connection abort");
                    controller.abort();
                    reject(new Error("Request timed out (connection check)"));
                }, timeout)
            );

            try {
                const checkConnectionWithTimeout = Promise.race([checkConnection(), timeoutPromise]);
                const res = await checkConnectionWithTimeout;
                console.log("connection check", res);
                if (!res) {
                    Alert.alert("Ошибка", "Соединение с комплексом утеряно! Попробуйте войти заново (1)...", [
                        {
                            text: "Попробовать снова",
                            onPress: () => {
                                navigation.navigate("AuthorizationPage", { message: "Соединение с комплексом утеряно! Попробуйте войти заново (1)..." });
                            }
                        }
                    ]);
                    // navigation.navigate("AutoAuthorizationPage");
                }
            } catch (err) {
                console.log("Connection check error:", err);
                Alert.alert("Ошибка", "Соединение с комплексом утеряно! Попробуйте войти заново (2)...", [
                    {
                        text: "Попробовать снова",
                        onPress: () => {
                            navigation.navigate("AuthorizationPage", { message: "Соединение с комплексом утеряно! Попробуйте войти заново (2)..." });
                        }
                    }
                ]);
                // navigation.navigate("AutoAuthorizationPage");
            }
        };

        const interval = setInterval(() => {
            process.env.NODE_ENV === "production" ? null  : null; // performConnectionCheck()
        }, 10000); // Проверка каждые 15 секунд

        // // Выполняем первую проверку сразу
        // performConnectionCheck();

        return () => {
            console.log("clearing connection check");
            clearInterval(interval);
            if (controller) {
                controller.abort();
            }
        };
    }, [checkConnection, navigation, ip, userName, password]);
};