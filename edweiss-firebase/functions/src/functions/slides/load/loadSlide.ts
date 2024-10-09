import SlidesDisplay from 'model/showtime/slides';
import { onAuthentifiedCall } from 'utils/firebase';
import { CollectionOf } from 'utils/firestore';
import { fail, ok } from 'utils/status';

export const loadSlide = onAuthentifiedCall(SlidesDisplay.Functions.load.loadSlide, async (userId, args) => {
    if (args.slide.images.length == 0)
        return fail("empty_PDF");

    const SlideCollection = CollectionOf<SlidesDisplay.Slides>("users/" + userId + "/slides");

    const res = await SlideCollection.add(args.slide);

    return ok({ id: res.id });
});
