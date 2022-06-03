import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import { InputAdornment, TextField } from "@mui/material";
import { UserOption, USER_OPTIONS_INVALID_INPUT_VALUE, USER_OPTIONS_LOADING_VALUE, USER_OPTIONS_MIN_SYMBOLS_VALUE, USER_OPTIONS_NEW_USER_VALUE } from '../../models/state';
import { AccountCircle } from '@mui/icons-material';

type UsersAutocompleteProps = {
    allUserOptions: UserOption[],
    selectedUserOption: UserOption | null,
    addNewUserOptionValue: number,
    children: React.ReactNode,
    onUserSelect: (option: UserOption | null) => any,
}

const UsersAutocomplete = (props: UsersAutocompleteProps) => {
    const { allUserOptions, selectedUserOption, onUserSelect, addNewUserOptionValue } = props;
    const addParticipantText = 'Создать участника: ';
    const filterUser = createFilterOptions<UserOption>();

    return (
        <>
            <Autocomplete 
                className="organizer-input"
                filterOptions={(_, params) => {
                    const { inputValue } = params;

                    // show loading indicator
                    // TODO test with slow backend responses
                    if (!allUserOptions.length) 
                        return [ new UserOption(USER_OPTIONS_LOADING_VALUE, true) ];

                    // do not show options until user types 3 symbols
                    if (inputValue.length < 3) 
                        return [ new UserOption(USER_OPTIONS_MIN_SYMBOLS_VALUE, true) ];
                        
                    const filtered = filterUser(allUserOptions, params);

                    if (!filtered.length) {
                        const firstNameInput = inputValue.split(' ')[0];
                        const lastNameInput = inputValue.split(' ')[1];
                        
                        // enter valid value option
                        if (!lastNameInput) {
                            return [ new UserOption(USER_OPTIONS_INVALID_INPUT_VALUE, true) ];
                        }
                        
                        // add participant option
                        return [ new UserOption(USER_OPTIONS_NEW_USER_VALUE, false, firstNameInput, lastNameInput) ];
                    }

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
                        <TextField 
                            {...params} 
                            label="Выберите пользователя:" 
                            placeholder='Иван Иванов' 
                            variant='standard'
                        />
                    )
                }}
                renderOption={(props, option) => {
                    return (
                        <span {...props} style={{ color: '#bcb7b7' }}>
                            {`${option.displayName} ${option.manuallyCreated ? ' (новый)' : ''}`}
                        </span>
                    );
                }}
                getOptionDisabled={(option) => option.disabled}
            />
        </>
    );
}

export default UsersAutocomplete;