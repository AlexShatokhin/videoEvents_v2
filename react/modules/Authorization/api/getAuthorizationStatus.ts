import DigestFetch from "react-native-digest-fetch"

const getAuthorizationStatus = async (userName: string, password: string, ip: string, serverIp: string) => {
    if (!ip) return false;

    const controller = new AbortController();
    const timeout = 5000;

    const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => {
            console.log("abort");
            controller.abort();
            reject(new Error("Request timed out"));
        }, timeout)
    );

    const deviceServerPromise = async () => {
        const response: Response = await fetch(`http://${serverIp}`, { signal: controller.signal });
        return response;
    }

    const fetchPromise = async () => {
        const url = `http://${ip}/ISAPI/Security/capabilities`;
        const response: Response = await DigestFetch(url, {
            method: 'GET',
            username: userName,
            password: password,
            signal: controller.signal
        });
        return response;
    };

    try {
        const complexResponse = await Promise.race([fetchPromise(), timeoutPromise]);
        const serverDeviceResponse = await Promise.race([deviceServerPromise(), timeoutPromise]);
        return complexResponse.ok && serverDeviceResponse.ok;
    } catch (error) {
        console.error(error);
        return false;
    }
};

export default getAuthorizationStatus;