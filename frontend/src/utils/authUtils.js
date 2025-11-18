// frontend/src/utils/authUtils.js

// export const getCurrentUserIdFromToken = () => {
//     try {
//         // Try multiple possible storage keys for the token to be backward compatible
//         const token = localStorage.getItem('userToken') || localStorage.getItem('token') || null;

//         if (!token) return null;

//         // Decode the Payload (the middle part of the JWT)
//         const parts = token.split('.');
//         if (parts.length !== 3) {
//             console.error("AuthUtil: Invalid token format.");
//             return null;
//         }

//         const base64Url = parts[1];
//         const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//         const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
//             return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
//         }).join(''));

//         const payload = JSON.parse(jsonPayload);

//         // Return the User ID from the token payload.
//         // The ID is often stored as 'id' or '_id'. We check both and convert to string.
//         const userId = payload.id || payload._id || null;

//         return userId ? String(userId) : null;
//     } catch (e) {
//         console.error("AuthUtil: Error during token decoding.", e);
//         return null;
//     }
// };

export const getCurrentUserIdFromToken = () => {
    try {
        const token =
            localStorage.getItem("userToken") ||
            localStorage.getItem("token") ||
            null;

        if (!token) return null;

        // Must contain exactly 3 parts
        const parts = token.split(".");
        if (parts.length !== 3) return null;

        // Decode JWT payload
        const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const json = JSON.parse(
            decodeURIComponent(
                atob(base64)
                    .split("")
                    .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                    .join("")
            )
        );

        // STRICT CHECK: if id missing → treat as logged out
        if (!json.id && !json._id) return null;
        if (json.id === "" || json._id === "") return null;

        return String(json.id || json._id);
    } catch (err) {
        return null;
    }
};

export const getCurrentUserRole = () => {
    try {
        // First, check if a direct userRole string was stored by the login pages
        const storedRole = localStorage.getItem('userRole');
        if (storedRole) return String(storedRole).toLowerCase();

        // Otherwise, try to decode role from a stored token (check multiple keys)
        const token = localStorage.getItem('userToken') || localStorage.getItem('token') || null;
        if (!token) return null;

        // Decode the Payload (the middle part of the JWT)
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);

        // The role field is typically named 'role'. Fall back to 'userRole' in payload if present.
        const roleFromPayload = payload.role || payload.userRole || null;
        return roleFromPayload ? String(roleFromPayload).toLowerCase() : null;
    } catch (e) {
        console.error("AuthUtil: Error during role decoding.", e);
        return null;
    }
};

export const getCurrentUserRoleFromToken = () => {
  try {
    const token =
      localStorage.getItem("userToken") ||
      localStorage.getItem("token") ||
      null;

    if (!token) return null;

    const parts = token.split(".");
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    const payload = JSON.parse(jsonPayload);

    return payload.role ? payload.role.toLowerCase() : null;
  } catch {
    return null;
  }
};
