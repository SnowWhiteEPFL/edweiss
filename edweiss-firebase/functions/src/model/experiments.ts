
import { FunctionFolder, FunctionOf } from './functions';

namespace Experiments {
	export const functions = FunctionFolder("experiments", {
		promptAI: FunctionOf<{ task: string, content: string }, string, any>("promptAI")
	});
}

export default Experiments;
