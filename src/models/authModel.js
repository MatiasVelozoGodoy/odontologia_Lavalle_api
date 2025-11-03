const db = require("../firebase");

const searchUser = async(email) => {
    const snapshot = await db.collection("users")
                                .where("email", "==", email)
                                .limit(1)
                                .get();
    
    return snapshot.empty ? null : snapshot.docs[0];
};

const addUser = async(userData) => {  
    return await db.collection("users").add(userData);
};

const resetPassword = async (email) => {
    const snapshot = await db.collection("users")
                            .where("email", "==", email)
                            .limit(1)
                            .get();

    if (snapshot.empty) return null;

    const userDoc = snapshot.docs[0];
    const userId = userDoc.id;

    const newPassword = "pass123";
    await db.collection("users").doc(userId).update({ password: newPassword });

    return userId;
};

module.exports = { searchUser, addUser, resetPassword };