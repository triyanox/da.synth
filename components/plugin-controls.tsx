import { cn } from '@/lib/utils';
import { SynthAction, SynthState } from '@/types';
import { Button } from './ui/button';
import { Card } from './ui/card';

const PluginControls: React.FC<{
  plugins: SynthState['plugins'];
  pluginOrder: string[];
  dispatch: React.Dispatch<SynthAction>;
}> = ({ plugins, pluginOrder, dispatch }) => {
  return pluginOrder.map((pluginId) => {
    const pluginState = plugins[pluginId];
    return (
      <Card
        key={pluginId}
        className="bg-gray-200 min-w-lg px-4 border-4 py-1 h-full flex flex-col gap-4 rounded-lg"
      >
        <div className="flex w-full justify-between gap-4 items-center">
          <h3 className="text-lg text-black font-semibold">
            {pluginState.plugin.name}
          </h3>
          <div className="flex gap-2">
            <Button
              size={'sm'}
              variant={pluginState.enabled ? 'default' : 'destructive'}
              onClick={() =>
                dispatch({ type: 'TOGGLE_PLUGIN', payload: pluginId })
              }
              className={`px-2 py-1  ${
                pluginState.enabled
                  ? 'hover:bg-green-500 bg-green-500'
                  : 'hover:bg-red-500 bg-red-500'
              } text-white`}
            >
              {pluginState.enabled ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                >
                  <path fill="currentColor" d="M11 3h2v18h-2z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M12 3a9 9 0 0 0-9 9a9 9 0 0 0 9 9a9 9 0 0 0 9-9a9 9 0 0 0-9-9m0 16a7 7 0 0 1-7-7a7 7 0 0 1 7-7a7 7 0 0 1 7 7a7 7 0 0 1-7 7"
                  />
                </svg>
              )}{' '}
            </Button>
            <Button
              size={'sm'}
              onClick={() =>
                dispatch({ type: 'REMOVE_PLUGIN', payload: pluginId })
              }
            >
              Remove
            </Button>
          </div>
        </div>
        <div
          className={cn(
            'flex flex-col gap-4',
            pluginState.enabled ? '' : 'opacity-10 pointer-events-none',
          )}
        >
          <pluginState.plugin.ControlComponent
            params={pluginState.params}
            setParams={(params) =>
              dispatch({
                type: 'UPDATE_PLUGIN_PARAMS',
                payload: { id: pluginId, params },
              })
            }
          />
        </div>
      </Card>
    );
  });
};

export default PluginControls;
