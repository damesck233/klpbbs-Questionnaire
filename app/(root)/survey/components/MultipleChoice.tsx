import { Checkbox, Group, Stack, Text } from '@mantine/core';
import classes from './MultipleChoice.module.css';
import { ChoiceProps } from './SingleChoice';

export function MultipleChoice(props: ChoiceProps) {
    const data = props.choice;

    // console.log(props.value);

    function setValue(value: string[]) {
        // console.log(JSON.stringify(value));
        props.setValue(JSON.stringify(value));
    }

    const cards = data.map(({ title, content }, index) => (
        <Checkbox.Card className={classes.root} radius="md" value={index.toString()} key={index} disabled={props.disabled}>
            <Group wrap="nowrap" align="flex-start">
                <Checkbox.Indicator />
                <div>
                    <Text className={classes.label}>{title}</Text>
                    <Text className={classes.description}>{content}</Text>
                </div>
            </Group>
        </Checkbox.Card>
    ));

    return (
        <>
            <Checkbox.Group
              value={props.value === undefined || props.value === '' ? [] : JSON.parse(props.value)}
              onChange={setValue}
            >
                <Stack pt="md" gap="xs">
                    {cards}
                </Stack>
            </Checkbox.Group>

            {/*<Text fz="xs" mt="md">*/}
            {/*    CurrentValue: {value.join(', ') || '–'}*/}
            {/*</Text>*/}
        </>
    );
}
