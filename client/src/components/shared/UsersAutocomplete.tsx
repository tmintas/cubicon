import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import { TextField } from "@mui/material";

interface UserOption {
    displayName: string
    userId: number,
    disabled: boolean,
}

const UsersAutocomplete = (props: any) => {
    const { allUserOptions, selectedUserOption, onUserSelect, addNewUserOptionValue } = props;
    const addParticipantText = 'Создать участника: ';
    const filterUser = createFilterOptions<UserOption>();

    return (
        <>
            <Autocomplete 
                className="organizer-input"
                filterOptions={(_, params) => {
                    const { inputValue } = params;

                    // do not show anything until user types 3 symbols
                    if (inputValue.length < 3) 
                        return [ { displayName: `Введите мин. 3 символа`, userId: null, disabled: true } ];

                    // show loading indicator
                    // TODO test with slow backend responses
                    if (!allUserOptions.length) 
                        return [ { displayName: 'Загрузка...', userId: null, disabled: true }];

                    const filtered = filterUser(allUserOptions, params);

                    // add participant opion
                    if (!filtered.length) 
                        return [ { displayName: `${addParticipantText}${inputValue}`, userId: addNewUserOptionValue, disabled: false } ];

                    return filtered;
                }}
                getOptionLabel={(option) => {
                    return option.displayName;
                }}
                value={selectedUserOption}
                onChange={(_, option) => {
                    onUserSelect(option);
                }}      
                options={[]}
                renderInput={(params) => {
                    // vs code complains about value property of inputProps here, so add 'any'
                    const props = params.inputProps as any;
                    const optionDisplayValue = props.value;
                    
                    // remove add participant text after selection
                    if (optionDisplayValue.indexOf(addParticipantText) > -1) {
                        props.value = optionDisplayValue.split(addParticipantText)[1];
                    }

                    return (
                        <TextField {...params} label="Выберите пользователя:" />
                    )
                }}
                renderOption={(props, option) => {
                    const { displayName } = option;
                    return (
                        <span {...props} style={{ color: '#bcb7b7' }}>
                        {displayName}
                        </span>
                    );
                }}
                getOptionDisabled={(option) => option.disabled}
            />
        </>
    );
}

export default UsersAutocomplete;