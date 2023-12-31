<script lang="ts">
    import Button from "./Button.svelte";
    import Checkbox from "./Checkbox.svelte";
    import SupportButton from "./SupportButton.svelte";
    import { onMount } from "svelte";
    import { writable, type Writable } from "svelte/store";
    import { reset } from "$lib/utils/reset";
    import { defaultValue } from "$lib/utils/getDefault";
    import { SETTINGS } from "$lib/store/settings";
    import { getModalStore, type ModalSettings, ProgressBar } from "@skeletonlabs/skeleton";
    import type { Store, Task } from "$lib/utils/interface";

    export let tasks: Record<string, Task>;
    export let tasksValue: Writable<Store>;
    export let resetTime: Date;
    export let max: number;
    export let label: string;
    export let width: number;

    const modalStore = getModalStore();

    function toDefaultValue() {
        if (Object.keys($tasksValue).length == 0) {
            for (const [name, task] of Object.entries(tasks)) {
                if (task.type != "booleanList") {
                    $tasksValue.Value[name] = defaultValue(task.type);
                } else {
                    $tasksValue.Value[name] = defaultValue(task.type, task.label.length);
                }
            }
        } else {
            for (const [name, task] of Object.entries(tasks)) {
                if ($tasksValue.Value[name]) continue;

                if (task.type != "booleanList") {
                    $tasksValue.Value[name] = defaultValue(task.type);
                } else {
                    $tasksValue.Value[name] = defaultValue(task.type, task.label.length);
                }
            }
        }
    }

    toDefaultValue();

    let now = new Date();
    const secondsDiff = writable(0);
    $: millisecondsDiff = resetTime.getTime() - now.getTime();
    $: secondsDiff.set(Math.floor(millisecondsDiff / 1000));

    $: seconds = $secondsDiff % 60;
    $: minutes = Math.floor(($secondsDiff / 60) % 60);
    $: hours = Math.floor($secondsDiff / 60 / 60);
    $: displayHours = hours > 24 ? hours % 24 : hours;
    $: days = hours > 24 ? Math.floor(hours / 24) : 0;

    function handleInput(value: number, max: number): number {
        if (value > max) {
            return max;
        } else if (value < 0 || value == null || isNaN(value)) {
            return 0;
        }

        return value;
    }

    const resetModal: ModalSettings = {
        type: "confirm",
        title: `Reset <span class="text-green-500 underline">${label}</span>?`,
        body: `Are you sure you want to reset <strong class="text-green-400 underline">${label}</strong>?`,
        backdropClasses: "backdrop-blur",
        response: (r) => {
            if (r) {
                const resetted = reset($tasksValue);
                tasksValue.set(resetted);
            }
        }
    };

    onMount(() => {
        const interval = setInterval(() => {
            now = new Date();
        }, 1000);

        let items = localStorage.getItem(`c_${label}`);
        if (items) {
            tasks = {
                ...tasks,
                ...JSON.parse(items)
            };
        }

        toDefaultValue();

        return () => clearInterval(interval);
    });

    const blur = $SETTINGS.task.backgroundBlur ? " backdrop-blur" : "";
</script>

<div
    class="mx-auto bg-surface-500 border-collapse table-fixed w-full lg:py-4{blur}"
    style="--tw-bg-opacity: {$SETTINGS.task.backgroundOpacity /
        100}; --tw-backdrop-blur: blur({$SETTINGS.task.backgroundBlurStrength}px; width: {width}%;"
>
    <div class="text-center">
        <h2 class="h2 text-blue-300 font-bold">- {label} -</h2>
        <h3 class="h3 text-lime-500">
            [
            <span class="text-blue-500">SEA</span>
            <span class="text-white">-</span>
            <span class="text-yellow-300">Odyssey</span>
            ]
        </h3>
        <h3 class="h3">
            {days ? `${days} days ` : ""}{displayHours} hours {minutes} minutes {seconds} seconds remaining
        </h3>
        <ProgressBar
            class="w-11/12"
            track={"bg-primary-900"}
            meter={"bg-primary-600"}
            value={$secondsDiff}
            {max}
        />
        <div class="flex flex-row">
            <button
                class="btn variant-ghost-error active:variant-filled-error lg:hover:variant-filled-error w-full"
                on:click={() => {
                    modalStore.trigger(resetModal);
                }}
            >
                Reset
            </button>
            <button
                class="btn variant-ghost-primary active:variant-filled-primary lg:hover:variant-filled-primary w-full"
                on:click={() => {
                    modalStore.trigger({
                        type: "component",
                        component: "addTask",
                        meta: {
                            category: label
                        },
                        response(r) {
                            if (r) {
                                tasks = {
                                    ...tasks,
                                    ...r
                                };
                                toDefaultValue();
                            }
                        }
                    });
                }}
            >
                + Add Task
            </button>
        </div>
    </div>
    {#each Object.entries(tasks) as [name, task]}
        <div class="item border-b border-primary-500 last:border-b-0">
            <div class="flex flex-col justify-center items-center pt-2 pb-4">
                {#if task.type === "number" && task.max}
                    <h3 class="h3 underline font-bold text-center px-2 pt-2 text-primary-300">
                        {name}
                    </h3>
                    <Button bind:value={$tasksValue.Value[name]} max={task.max} />
                {:else if task.type === "boolean"}
                    <Checkbox bind:value={$tasksValue.Value[name]} text={name} />
                {:else if task.type === "booleanList"}
                    <h3 class="h3 underline font-bold text-center px-2 pt-2 text-primary-300 pb-2">
                        {name}
                    </h3>
                    <div>
                        {#each task.label as value, idx}
                            <Checkbox
                                bind:value={$tasksValue.Value[name][idx]}
                                text={typeof task.label == "object" && value ? value : ""}
                                single={true}
                            />
                        {/each}
                    </div>
                {:else if task.type === "numberWithButtons" && task.max && task.buttons}
                    <h3 class="h3 underline font-bold text-center px-2 pt-2 text-primary-300">
                        {name}
                    </h3>
                    <span class="pb-2">Max: <strong class="text-center">{task.max}</strong></span>
                    <div>
                        <input
                            class="input text-center p-1 text-lg border border-primary-500"
                            type="number"
                            bind:value={$tasksValue.Value[name]}
                            on:input={() => {
                                // @ts-ignore
                                const newValue = handleInput(task.value, task.max);
                                $tasksValue.Value[name] = newValue;
                            }}
                        />
                        <br />
                        <hr />
                        <div class="flex flex-row justify-center">
                            {#each task.buttons as button}
                                <SupportButton
                                    bind:value={$tasksValue.Value[name]}
                                    max={task.max}
                                    step={button}
                                />
                            {/each}
                            <SupportButton
                                bind:value={$tasksValue.Value[name]}
                                max={task.max}
                                step={task.max}
                            />
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    {/each}
</div>
