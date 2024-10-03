import { Collections, ITwoFactor, IUser, Status } from "@/constants/database";
import connectToDatabase from "@/lib/clientDB";

export async function getTwoFactorValid(email: any) {
  try {
    // Get user collection
    const { client, db } = await connectToDatabase();
    const collection = db.collection<IUser>(Collections.User);
    const user = await collection.findOne({ email: email });

    if (!user) { client.close(); return false; }

    // If two factor is not enabled, 
    // it should be direct dashboard without two factor check
    if (!user.twofactorEnabled) { client.close(); return true; }

    const twoFactorCollection = db.collection<ITwoFactor>(Collections.TwoFactor);
    const twoFactor = await twoFactorCollection.findOne({ userId: user._id.toString() });
    if (!twoFactor) { client.close(); return false; }

    // Check verification
    if (twoFactor.twofactorStatus === Status.VERIFIED) { client.close(); return true; }

    client.close();

  } catch (error) {
    console.log(error)
  }

  return false;
}

export async function getStatusUser(email: any) {
  try {
    // Get user collection
    const { client, db } = await connectToDatabase();
    const collection = db.collection<IUser>(Collections.User);
    const user = await collection.findOne({ email: email });

    if (!user) { client.close(); return false; }

    // When user is new from social authentication,
    // user will need to regist in onboarding stage
    if (user.status === Status.NEW) { client.close(); return true; }

    client.close();
  } catch (error) {
    console.log(error)
  }

  return false;
}

export async function getUserPlanStatus(email: any) {
  try {
    // Get user collection
    const { client, db } = await connectToDatabase();
    const collection = db.collection<IUser>(Collections.User);
    const user = await collection.findOne({ email: email });

    if (!user) { client.close(); return false; }

    // If user's plan has expired, they should manage
    // their plan
    if (user.status === Status.EXPIRED) { client.close(); return true; }

    client.close();
  } catch (error) {
    console.log(error)
  }

  return false;
}


export async function getPasswordStatus(email: any) {
  try {
    // Get user collection
    const { client, db } = await connectToDatabase();
    const collection = db.collection<IUser>(Collections.User);
    const user = await collection.findOne({ email: email });

    if (!user) { client.close(); return false; }

    // If user signed up for using google authentication,
    // user wouldn't need password change
    if (user.password) { client.close(); return true; }

    client.close();
  } catch (error) {
    console.log(error)
  }

  return false;
}

// When user signout, this function will set pending status for two factor
// verification status. It needs for the social authentification required.
export async function updateTwofactorStatus(email: string) {
  try {
    // Get user collection
    const { client, db } = await connectToDatabase();
    const collection = db.collection<IUser>(Collections.User);
    const user = await collection.findOne({ email: email });

    if (!user) { client.close(); return false; }

    // When user signout on website, will set disabled status when verified already.
    // This needs for next verification after first factor verified.
    // TwoFactor status will use VERIFIED (both), (unverfied, pending) from API, DISABLED
    if (user.twofactorEnabled) {
      await db.collection(Collections.TwoFactor).updateOne(
        { userId: user?._id.toString(), twofactorStatus: Status.VERIFIED },
        {
          $set: {
            twofactorStatus: Status.DISABLED,
            updatedAt: new Date().toISOString(),
          }
        }
      )
    }

    client.close();
  } catch (error) {
    console.log(error)
  }

  return false;
}
